import type { BetaKnowledgePoint, BetaQuestion, BetaReviewItem } from "@/domain/beta";

export interface ExamPoint {
  id: string;
  subjectId: string;
  chapterId: string;
  knowledgePointId: string;
  title: string;
  importance: 1 | 2 | 3 | 4 | 5;
  reason: string;
  commonQuestionTypes: string[];
  commonMistakes: string;
  relatedQuestionIds: string[];
  reviewStatus: "not_scheduled" | "due" | "completed";
  sourceType: "system-priority" | "ai-assisted" | "verified-past-paper";
  confidence: "editorial" | "ai-estimate" | "source-backed";
}

// Only editorial system priorities are produced here. No unsupported past-paper frequency claims.
export function deriveSystemExamPoints(
  points: BetaKnowledgePoint[], questions: BetaQuestion[], reviews: BetaReviewItem[],
): ExamPoint[] {
  return points.filter((point) => (point.importance ?? 0) >= 4).map((point) => {
    const relatedQuestionIds = questions.filter((question) => question.knowledgePointId === point.id).map((question) => question.id);
    const review = reviews.filter((item) => item.kind === "knowledge" && item.targetId === point.id).at(-1);
    return {
      id: `exam-point-${point.id}`, subjectId: point.subjectId, chapterId: point.chapterId,
      knowledgePointId: point.id, title: point.title, importance: point.importance ?? 4,
      reason: point.keyPoints, commonQuestionTypes: relatedQuestionIds.length ? ["choice", "recall"] : ["recall"],
      commonMistakes: point.pitfalls, relatedQuestionIds,
      reviewStatus: review?.status === "due" ? "due" : review?.status === "completed" ? "completed" : "not_scheduled",
      sourceType: "system-priority", confidence: "editorial",
    };
  });
}
