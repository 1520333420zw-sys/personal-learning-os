import type { BetaState } from "@/domain/beta";
import type { LearningMirrorSync, MirrorDeletion, MirroredStudySession, MirroredTask } from "@/domain/learning-mirror";
import { toLocalDateKey } from "@/lib/date";

const ledgerKey = "personal-learning-os:learning-mirror:v1";
const batchSize = 200;
interface MirrorLedger { sessions: Record<string, string>; tasks: Record<string, string>; }

function readLedger(): MirrorLedger {
  try {
    const value = JSON.parse(window.localStorage.getItem(ledgerKey) ?? "null") as Partial<MirrorLedger> | null;
    if (value && typeof value.sessions === "object" && typeof value.tasks === "object") {
      return { sessions: value.sessions ?? {}, tasks: value.tasks ?? {} };
    }
  } catch { /* A missing or damaged sync ledger causes a safe upsert-only resync. */ }
  return { sessions: {}, tasks: {} };
}

function writeLedger(value: MirrorLedger) {
  window.localStorage.setItem(ledgerKey, JSON.stringify(value));
}

function fingerprint(value: object): string {
  const input = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${input.length}:${(hash >>> 0).toString(16)}`;
}

export function projectLearningMirror(state: BetaState) {
  const subjects = new Map(state.subjects.map((item) => [item.id, item]));
  const chapters = new Map(state.chapters.map((item) => [item.id, item]));
  const sessions: MirroredStudySession[] = state.studySessions.filter((item) => item.completed).map((item) => {
    const subject = item.subjectId ? subjects.get(item.subjectId) : undefined;
    const chapter = item.chapterId ? chapters.get(item.chapterId) : undefined;
    return { id: item.id, updatedAt: item.updatedAt, localDate: toLocalDateKey(new Date(item.startedAt)),
      subjectId: item.subjectId, subjectName: subject?.name, subjectNameEn: subject?.nameEn,
      chapterId: item.chapterId, chapterTitle: chapter?.title, chapterTitleEn: chapter?.titleEn,
      startedAt: item.startedAt, endedAt: item.endedAt, durationMinutes: item.durationMinutes,
      sessionType: item.sessionType, itemCount: item.itemCount, incorrectCount: item.incorrectCount };
  });
  const tasks: MirroredTask[] = state.tasks.map((item) => {
    const subject = item.subjectId ? subjects.get(item.subjectId) : undefined;
    const chapter = item.chapterId ? chapters.get(item.chapterId) : undefined;
    return { id: item.id, updatedAt: item.updatedAt, date: item.date, title: item.title,
      subjectId: item.subjectId, subjectName: subject?.name, subjectNameEn: subject?.nameEn,
      chapterId: item.chapterId, chapterTitle: chapter?.title, chapterTitleEn: chapter?.titleEn,
      plannedMinutes: item.plannedMinutes, actualMinutes: item.actualMinutes,
      priority: item.priority, status: item.status };
  });
  return { sessions, tasks };
}

export function createLearningMirrorChanges(state: BetaState, prior = readLedger()) {
  const projection = projectLearningMirror(state);
  const sessionHashes = Object.fromEntries(projection.sessions.map((item) => [item.id, fingerprint(item)]));
  const taskHashes = Object.fromEntries(projection.tasks.map((item) => [item.id, fingerprint(item)]));
  const now = new Date().toISOString();
  const sessions = projection.sessions.filter((item) => prior.sessions[item.id] !== sessionHashes[item.id]);
  const tasks = projection.tasks.filter((item) => prior.tasks[item.id] !== taskHashes[item.id]);
  const deletions: MirrorDeletion[] = [
    ...Object.keys(prior.sessions).filter((id) => !(id in sessionHashes)).map((id) => ({ entityType: "study_session" as const, id, deletedAt: now })),
    ...Object.keys(prior.tasks).filter((id) => !(id in taskHashes)).map((id) => ({ entityType: "task" as const, id, deletedAt: now })),
  ];
  return { sessions, tasks, deletions, ledger: { sessions: sessionHashes, tasks: taskHashes } };
}

export async function syncLearningMirror(state: BetaState): Promise<"synced" | "unchanged" | "unauthorized" | "failed"> {
  const changes = createLearningMirrorChanges(state);
  const operations = [
    ...changes.sessions.map((value) => ({ kind: "session" as const, value })),
    ...changes.tasks.map((value) => ({ kind: "task" as const, value })),
    ...changes.deletions.map((value) => ({ kind: "deletion" as const, value })),
  ];
  if (!operations.length) return "unchanged";
  for (let index = 0; index < operations.length; index += batchSize) {
    const batch = operations.slice(index, index + batchSize);
    const payload: LearningMirrorSync = {
      sessions: batch.filter((item) => item.kind === "session").map((item) => item.value as MirroredStudySession),
      tasks: batch.filter((item) => item.kind === "task").map((item) => item.value as MirroredTask),
      deletions: batch.filter((item) => item.kind === "deletion").map((item) => item.value as MirrorDeletion),
    };
    let response: Response;
    try {
      response = await fetch("/api/external-writes/learning-mirror", { method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch { return "failed"; }
    if (response.status === 401) return "unauthorized";
    if (!response.ok) return "failed";
  }
  writeLedger(changes.ledger);
  return "synced";
}

export function clearLearningMirrorLedger() {
  window.localStorage.removeItem(ledgerKey);
}
