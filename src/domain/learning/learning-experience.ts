import type { BetaFeynmanAttempt, BetaSectionProgress, BetaState } from "@/domain/beta";
import { applyReviewRating, reviewDefaults } from "@/domain/review/review-engine";
import type { CurriculumCatalog, TeachingUnit } from "./curriculum";

export interface FeynmanFeedback { matchedTerms: string[]; missingTerms: string[]; complete: boolean; message: string; }
export function evaluateFeynman(response: string, unit: TeachingUnit): FeynmanFeedback {
  const normalized = response.toLocaleLowerCase();
  const matchedTerms = unit.requiredTerms.filter((term) => normalized.includes(term.toLocaleLowerCase()));
  const missingTerms = unit.requiredTerms.filter((term) => !matchedTerms.includes(term));
  const complete = response.trim().length >= 24 && (unit.requiredTerms.length === 0 || matchedTerms.length >= Math.ceil(unit.requiredTerms.length * 0.6));
  return { matchedTerms, missingTerms, complete, message: complete ? "复述已经覆盖主要概念，可以进入即时检测。" : `先补上${missingTerms.slice(0, 3).join("、") || "更具体的条件和例子"}，再用更简单的话讲一次。` };
}

export function resolveContinueLearning(state: BetaState, catalog: CurriculumCatalog) {
  const latest = [...state.courseProgress].sort((a, b) => b.lastStudiedAt.localeCompare(a.lastStudiedAt))[0];
  const curriculum = catalog.curricula.find((item) => item.id === latest?.curriculumId) ?? catalog.curricula.find((item) => item.id === "curriculum-psychology") ?? catalog.curricula[0];
  if (!curriculum) return null;
  const chapters = catalog.chapters.filter((item) => item.curriculumId === curriculum.id).sort((a, b) => a.order - b.order);
  let chapter = chapters.find((item) => item.id === latest?.lastChapterId) ?? chapters[0];
  let sections = catalog.sections.filter((item) => item.chapterId === chapter?.id).sort((a, b) => a.order - b.order);
  let section = sections.find((item) => item.id === latest?.lastSectionId) ?? sections.find((item) => state.sectionProgress.find((progress) => progress.sectionId === item.id)?.status !== "completed") ?? sections[0];
  if (section && state.sectionProgress.find((item) => item.sectionId === section.id)?.status === "completed") {
    const next = sections.find((item) => item.order > section!.order && state.sectionProgress.find((progress) => progress.sectionId === item.id)?.status !== "completed");
    if (next) section = next;
    else {
      const nextChapter = chapters.find((item) => item.order > chapter.order);
      if (nextChapter) { chapter = nextChapter; sections = catalog.sections.filter((item) => item.chapterId === chapter.id).sort((a, b) => a.order - b.order); section = sections[0]; }
    }
  }
  return chapter && section ? { curriculum, chapter, section } : null;
}

export function estimatedMastery(progress: BetaSectionProgress | undefined) {
  if (!progress) return "not_started" as const;
  if (progress.status === "completed" && progress.quickCheckTotal > 0 && progress.quickCheckCorrect / progress.quickCheckTotal >= 0.8) return "solid" as const;
  if (progress.status === "completed") return "needs_review" as const;
  return "learning" as const;
}

export function feynmanEvidence(attempt: BetaFeynmanAttempt | undefined) {
  if (!attempt) return 0;
  return attempt.missingTerms.length === 0 ? 2 : attempt.matchedTerms.length ? 1 : -1;
}

export function recordQuickCheckAttempt(state: BetaState, questionId: string, answer: string[], now: Date, idFactory: (prefix: string) => string): boolean {
  const question = state.questions.find((item) => item.id === questionId); if (!question) throw new Error("Unknown quick-check question");
  const correct = answer.length === question.answer.length && [...answer].sort().every((item, index) => item === [...question.answer].sort()[index]); const timestamp = now.toISOString();
  state.questionAttempts.unshift({ id:idFactory("attempt"),ownerId:state.ownerId,createdAt:timestamp,updatedAt:timestamp,questionId,answer,correct,attemptedAt:timestamp });
  const point = state.knowledgePoints.find((item) => item.id === question.knowledgePointId); if (point) { point.mastery = correct ? "learning" : "reviewing"; point.lastStudiedAt = timestamp; point.updatedAt = timestamp; }
  if (!correct) {
    const wrong = state.wrongQuestions.find((item) => item.questionId === questionId);
    if (wrong) { wrong.mastered = false; wrong.lastAttemptAt = timestamp; wrong.updatedAt = timestamp; }
    else state.wrongQuestions.push({ id:idFactory("wrong"),ownerId:state.ownerId,createdAt:timestamp,updatedAt:timestamp,questionId,mastered:false,lastAttemptAt:timestamp });
    let review = state.reviewItems.find((item) => item.kind === "question" && item.targetId === questionId && item.status === "due");
    if (!review) { review = { id:idFactory("review"),ownerId:state.ownerId,createdAt:timestamp,updatedAt:timestamp,kind:"question",targetId:questionId,title:question.stem,dueDate:localDate(now),status:"due",subjectId:question.subjectId,chapterId:question.chapterId,...reviewDefaults("question") }; state.reviewItems.push(review); }
    applyReviewRating(review,"again",now);
  }
  return correct;
}

export function completeCurriculumSection(state: BetaState, input: { curriculumId: string; chapterId: string; sectionId: string; chapterSectionIds: string[]; correct: number; total: number }, now = new Date()) {
  const timestamp = now.toISOString(); const progress = state.sectionProgress.find((item) => item.sectionId === input.sectionId); if (!progress) throw new Error("Section progress must be started before completion");
  progress.status="completed";progress.quickCheckCompleted=true;progress.quickCheckCorrect=input.correct;progress.quickCheckTotal=input.total;progress.completedAt=timestamp;progress.lastStudiedAt=timestamp;progress.updatedAt=timestamp;
  let chapter = state.chapterProgress.find((item) => item.chapterId === input.chapterId);
  if (!chapter) { chapter={id:`chapter-progress-${input.chapterId}`,ownerId:state.ownerId,createdAt:timestamp,updatedAt:timestamp,curriculumId:input.curriculumId,chapterId:input.chapterId,completedSectionIds:[],chapterPracticeCompleted:false,recitationCompleted:false,reviewScheduled:false,lastStudiedAt:timestamp};state.chapterProgress.push(chapter); }
  if(!chapter.completedSectionIds.includes(input.sectionId))chapter.completedSectionIds.push(input.sectionId);chapter.lastStudiedAt=timestamp;chapter.updatedAt=timestamp;
  if(input.chapterSectionIds.every((id)=>chapter!.completedSectionIds.includes(id)))chapter.completedAt=timestamp;
}

function localDate(date: Date) { const shifted=new Date(date.getTime()-date.getTimezoneOffset()*60_000);return shifted.toISOString().slice(0,10); }
