import type { CoreLearningRepositories } from "./contracts";
import { createMockLearningRepositories } from "./mock";
import type { UserId } from "@/domain";
import { LearningQueryService } from "@/features/learning/services";
import {
  createCoreLearningFixtures,
  DEMO_USER_ID,
} from "@/mocks/fixtures";

export interface CoreLearningDataContext {
  userId: UserId;
  repositories: CoreLearningRepositories;
  queries: LearningQueryService;
}

export function createCoreLearningDataContext(
  referenceDate = new Date(),
): CoreLearningDataContext {
  const fixtures = createCoreLearningFixtures(referenceDate);
  const repositories = createMockLearningRepositories(fixtures);

  return {
    userId: DEMO_USER_ID,
    repositories,
    queries: new LearningQueryService({
      tasks: repositories.tasks,
      reviews: repositories.reviews,
      studySessions: repositories.studySessions,
    }),
  };
}

export type {
  ChapterRepository,
  CoreLearningRepositories,
  ExamPaperRepository,
  KnowledgePointRepository,
  PlanRepository,
  QuestionBankRepository,
  QuestionRepository,
  ReviewRepository,
  StudySessionRepository,
  SubjectRepository,
  TaskRepository,
} from "./contracts";
