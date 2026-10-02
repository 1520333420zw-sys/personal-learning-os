import type { BetaRecitation, BetaState } from "@/domain/beta";
import { localDate, nowEntity, uid } from "./shared";
import { applyReviewRating, reviewDefaults, type ReviewRating } from "@/domain/review/review-engine";

export type RecallRating = "forgot" | "vague" | "remembered" | "mastered";
const reviewRating:Record<RecallRating,ReviewRating>={forgot:"again",vague:"hard",remembered:"good",mastered:"easy"};

export function dueRecitations(state: BetaState, date = localDate()): BetaRecitation[] {
  return state.recitations.filter((item) => item.status !== "mastered" && (!item.nextReviewAt || item.nextReviewAt <= date));
}

export function reviewRecitation(state: BetaState, id: string, rating: RecallRating, now = new Date()): void {
  const item = state.recitations.find((record) => record.id === id);
  if (!item) return;
  let review=state.reviewItems.find((record)=>record.kind==="recitation"&&record.targetId===id&&record.status==="due");
  if(!review){review={...nowEntity(uid("review"),state.ownerId),kind:"recitation",targetId:id,title:item.title,dueDate:localDate(now),status:"due",subjectId:item.subjectId,chapterId:item.chapterId,...reviewDefaults("recitation")};state.reviewItems.push(review);}
  applyReviewRating(review,reviewRating[rating],now);
  item.lastReviewedAt = now.toISOString();
  item.reviewCount = (item.reviewCount ?? 0) + 1;
  item.nextReviewAt = review.dueDate;
  item.status = rating === "mastered" ? "mastered" : "review";
  item.mastery = rating === "mastered" ? "mastered" : rating === "forgot" ? "learning" : "reviewing";
  item.updatedAt = now.toISOString();
  review.status=rating==="mastered"?"mastered":"due";
}

export function addKnowledgeToRecitation(state: BetaState, pointId: string): void {
  const point = state.knowledgePoints.find((record) => record.id === pointId);
  if (!point || state.recitations.some((record) => record.knowledgePointId === pointId)) return;
  const chapter = state.chapters.find((record) => record.id === point.chapterId);
  state.recitations.push({
    ...nowEntity(uid("recitation"), state.ownerId), title: point.title,
    category: chapter?.title ?? "", content: [point.coreConcept, point.keyPoints].filter(Boolean).join("\n"),
    status: "today", favorite: false, nextReviewAt: localDate(), subjectId: point.subjectId,
    chapterId: point.chapterId, knowledgePointId: point.id, type: "knowledge", reviewCount: 0, mastery: "new",
  });
}
