import type {
  EntityBase,
  EntityId,
  ISODateTimeString,
} from "@/domain/common/entity";

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay";

export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "draft" | "active" | "archived";
export type QuestionBankStatus = "active" | "archived";
export type ExamPaperStatus = "draft" | "active" | "archived";
export type ExamPaperType =
  | "past_exam"
  | "mock_exam"
  | "practice"
  | "custom";

export type QuestionSourceType =
  | "official_exam"
  | "textbook"
  | "mock"
  | "manual";

export interface QuestionSource {
  type: QuestionSourceType;
  name: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question extends EntityBase {
  subjectId: EntityId;
  chapterId?: EntityId;
  knowledgePointId?: EntityId;
  questionBankId?: EntityId;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  source: QuestionSource;
  year?: number;
  stem: string;
  options?: readonly QuestionOption[];
  answer: string | readonly string[];
  explanation: string;
  status: QuestionStatus;
}

export interface QuestionAttempt extends EntityBase {
  questionId: EntityId;
  studySessionId?: EntityId;
  answer: string | readonly string[];
  isCorrect: boolean;
  attemptedAt: ISODateTimeString;
  durationSeconds?: number;
}

export interface QuestionBank extends EntityBase {
  subjectId: EntityId;
  title: string;
  description: string;
  source: QuestionSource;
  status: QuestionBankStatus;
}

export interface ExamPaper extends EntityBase {
  subjectId: EntityId;
  title: string;
  year?: number;
  questionIds: readonly EntityId[];
  paperType: ExamPaperType;
  status: ExamPaperStatus;
}
