import type { EntityBase, EntityId } from "@/domain/common/entity";

export type SubjectCategory =
  | "professional"
  | "politics"
  | "language"
  | "general";

export type SubjectStatus = "active" | "archived";
export type LearningContentStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "archived";
export type MasteryLevel = "new" | "learning" | "familiar" | "mastered";

export interface Subject extends EntityBase {
  name: string;
  slug: string;
  category: SubjectCategory;
  description: string;
  status: SubjectStatus;
  sortOrder: number;
}

export interface Chapter extends EntityBase {
  subjectId: EntityId;
  title: string;
  description: string;
  sortOrder: number;
  status: LearningContentStatus;
}

export interface KnowledgePoint extends EntityBase {
  subjectId: EntityId;
  chapterId: EntityId;
  title: string;
  summary: string;
  status: LearningContentStatus;
  masteryLevel: MasteryLevel;
}
