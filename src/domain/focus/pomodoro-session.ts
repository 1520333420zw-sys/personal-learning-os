import type {
  EntityBase,
  EntityId,
  ISODateTimeString,
} from "@/domain/common/entity";
import type { StudyCategory } from "@/domain/study/study-session";

export type PomodoroStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "cancelled";

export interface PomodoroSession extends EntityBase {
  studySessionId?: EntityId;
  category: StudyCategory;
  startedAt: ISODateTimeString;
  endsAt: ISODateTimeString;
  pausedAt?: ISODateTimeString;
  remainingSeconds?: number;
  status: PomodoroStatus;
}
