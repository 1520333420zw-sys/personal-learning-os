import type {
  EntityBase,
  EntityId,
  ISODateString,
  ISODateTimeString,
} from "@/domain/common/entity";
import type { StudyTargetRef } from "@/domain/learning/study-target";

export type PlanStatus = "draft" | "active" | "completed" | "archived";
export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskSourceType = "manual" | "review" | "study_plan" | "exam" | "system";

export interface Plan extends EntityBase {
  title: string;
  description: string;
  startDate: ISODateString;
  endDate: ISODateString;
  status: PlanStatus;
}

export interface Task extends EntityBase {
  planId: EntityId;
  title: string;
  description?: string;
  subjectId?: EntityId;
  scheduledDate: ISODateString;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number;
  target: StudyTargetRef;
  completedAt?: ISODateTimeString;
  sourceType: TaskSourceType;
}

export interface CreateTaskInput {
  planId: EntityId;
  title: string;
  description?: string;
  subjectId?: EntityId;
  scheduledDate: ISODateString;
  priority: TaskPriority;
  estimatedMinutes: number;
  target: StudyTargetRef;
  sourceType: TaskSourceType;
}

export type UpdateTaskInput = Partial<
  Pick<
    Task,
    | "title"
    | "description"
    | "subjectId"
    | "scheduledDate"
    | "priority"
    | "estimatedMinutes"
    | "target"
    | "status"
    | "completedAt"
    | "sourceType"
  >
>;
