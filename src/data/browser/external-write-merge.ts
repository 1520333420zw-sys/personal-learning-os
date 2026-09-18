import type { BetaState } from "@/domain/beta";
import type { ExternalWriteReceipt } from "@/domain/external-writes/command";

function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function applyExternalWrite(state: BetaState, receipt: ExternalWriteReceipt): string[] {
  if (state.externalWriteReceipts.some((entry) => entry.id === receipt.id)) return [];
  if (receipt.status !== "pending") throw new Error("WRITE_NOT_PENDING");
  const command = receipt.command;
  if ("subjectId" in command && command.subjectId && !state.subjects.some((item) => item.id === command.subjectId)) throw new Error("UNKNOWN_SUBJECT");
  const chapter = "chapterId" in command ? state.chapters.find((item) => item.id === command.chapterId) : undefined;
  if ("chapterId" in command && command.chapterId && (!chapter || (command.subjectId && chapter.subjectId !== command.subjectId))) throw new Error("UNKNOWN_CHAPTER");
  const subjectId = "subjectId" in command ? command.subjectId ?? chapter?.subjectId : undefined;
  const now = new Date();
  const timestamp = now.toISOString();
  const id = `external-${receipt.id}`;
  const base = { id, ownerId: state.ownerId, createdAt: timestamp, updatedAt: timestamp };
  const entityIds = [id];
  switch (command.type) {
    case "study_session": {
      const endedAt = command.date === localDate(now) ? now : new Date(`${command.date}T12:00:00`);
      const startedAt = new Date(endedAt.getTime() - command.durationMinutes * 60_000);
      state.studySessions.unshift({ ...base, subjectId, chapterId: command.chapterId,
        startedAt: startedAt.toISOString(), endedAt: endedAt.toISOString(), durationMinutes: command.durationMinutes,
        sessionType: command.sessionType, itemCount: command.itemCount, incorrectCount: command.incorrectCount, completed: true });
      break;
    }
    case "task":
      state.tasks.unshift({ ...base, title: command.title.trim(), description: command.description?.trim() ?? "",
        subjectId, chapterId: command.chapterId, date: command.date,
        plannedMinutes: command.plannedMinutes, actualMinutes: 0, priority: command.priority,
        status: "todo", sourceType: "ai", planningControl: "manual" });
      break;
    case "recitation":
      state.recitations.unshift({ ...base, title: command.title.trim(), content: command.content.trim(),
        category: command.category?.trim() ?? "", subjectId, chapterId: command.chapterId,
        status: "today", favorite: false, nextReviewAt: command.nextReviewAt ?? localDate(now),
        type: "custom", reviewCount: 0, mastery: "new" });
      break;
    case "reading":
      state.reading.unshift({ ...base, title: command.title.trim(), source: command.source?.trim() ?? "",
        url: command.url ?? "", publishedDate: command.publishedDate ?? "", category: command.category?.trim() ?? "",
        notes: command.notes?.trim() ?? "", summary: command.summary?.trim() ?? "", excerpt: "",
        vocabulary: [], status: "unread", favorite: false });
      break;
    case "wrong_question": {
      const question = state.questions.find((item) => item.id === command.questionId);
      if (!question) throw new Error("UNKNOWN_QUESTION");
      if (state.wrongQuestions.some((item) => item.questionId === question.id)) throw new Error("QUESTION_ALREADY_IN_WRONG_BOOK");
      state.wrongQuestions.unshift({ ...base, questionId: question.id, mastered: false, lastAttemptAt: timestamp });
      const reviewId = `${id}-review`;
      if (!state.reviewItems.some((item) => item.kind === "question" && item.targetId === question.id && item.status === "due")) {
        state.reviewItems.unshift({ ...base, id: reviewId, kind: "question", targetId: question.id,
          title: question.stem, dueDate: localDate(now), status: "due" });
        entityIds.push(reviewId);
      }
      break;
    }
  }
  state.externalWriteReceipts.unshift({ id: receipt.id, type: command.type, entityIds, importedAt: timestamp });
  return entityIds;
}

export function revertExternalWrite(state: BetaState, receiptId: string): boolean {
  const entry = state.externalWriteReceipts.find((item) => item.id === receiptId);
  if (!entry || entry.revertedAt) return false;
  if (state.studySessions.some((item) => item.taskId && entry.entityIds.includes(item.taskId) && !entry.entityIds.includes(item.id)) ||
    state.readingNotes.some((item) => entry.entityIds.includes(item.readingId))) throw new Error("IMPORTED_ITEM_HAS_DEPENDENCIES");
  for (const key of ["tasks", "studySessions", "recitations", "reading", "wrongQuestions", "reviewItems"] as const) {
    // Only records created by this import are removed; existing local data is untouched.
    (state[key] as { id: string }[]) = state[key].filter((item) => !entry.entityIds.includes(item.id));
  }
  entry.revertedAt = new Date().toISOString();
  return true;
}
