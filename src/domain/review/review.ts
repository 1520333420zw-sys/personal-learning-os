import type {
  EntityBase,
  ISODateString,
  ISODateTimeString,
} from "@/domain/common/entity";
import type { StudyTargetRef } from "@/domain/learning/study-target";

export type ReviewType =
  | "vocabulary"
  | "recitation"
  | "question"
  | "knowledgePoint"
  | "custom";

export type ReviewStatus = "pending" | "completed" | "cancelled";

export interface Review extends EntityBase {
  target: StudyTargetRef;
  scheduledFor: ISODateString;
  completedAt?: ISODateTimeString;
  status: ReviewStatus;
  reviewType: ReviewType;
}
