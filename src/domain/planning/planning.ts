import type {
  EntityBase,
  EntityId,
  ISODateString,
} from "@/domain/common/entity";
import type { StudyTargetRef } from "@/domain/learning/study-target";

export type PlanStatus = "draft" | "active" | "completed" | "archived";
export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

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
  description: string;
  scheduledDate: ISODateString;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number;
  target: StudyTargetRef;
}
