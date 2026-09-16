import type {
  ISODateString,
  TaskPriority,
  TaskStatus,
} from "@/domain";

export type StudyPlanFilter = "all" | "todo" | "in_progress" | "completed";

export interface StudyPlanTaskViewModel {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  subjectName: string;
  date: ISODateString;
  plannedMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface StudyPlanSummary {
  total: number;
  completed: number;
  remaining: number;
  plannedMinutes: number;
}

export interface StudyPlanSubjectViewModel {
  id: string;
  name: string;
}

export interface StudyPlanDayData {
  date: ISODateString;
  tasks: readonly StudyPlanTaskViewModel[];
  subjects: readonly StudyPlanSubjectViewModel[];
  summary: StudyPlanSummary;
}

export interface StudyTaskDraft {
  title: string;
  description?: string;
  subjectId?: string;
  date: ISODateString;
  plannedMinutes: number;
  priority: TaskPriority;
}
