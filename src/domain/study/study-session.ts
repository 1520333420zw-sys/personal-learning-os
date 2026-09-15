import type {
  EntityBase,
  EntityId,
  ISODateTimeString,
} from "@/domain/common/entity";
import type { StudyTargetRef } from "@/domain/learning/study-target";

export type StudySessionType =
  | "learning"
  | "review"
  | "practice"
  | "recitation"
  | "reading";

export type StudySessionStatus = "active" | "completed" | "cancelled";

export type StudyCategory =
  | "psychology"
  | "politics"
  | "vocabulary"
  | "recitation"
  | "reading"
  | "books"
  | "other";

export interface StudySession extends EntityBase {
  subjectId: EntityId;
  taskId?: EntityId;
  target: StudyTargetRef;
  startedAt: ISODateTimeString;
  endedAt?: ISODateTimeString;
  durationMinutes: number;
  sessionType: StudySessionType;
  status: StudySessionStatus;
  notes: string;
}
