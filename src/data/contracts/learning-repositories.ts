import type {
  Chapter,
  EntityId,
  ExamPaper,
  ISODateString,
  KnowledgePoint,
  Plan,
  Question,
  QuestionBank,
  Review,
  StudySession,
  Subject,
  Task,
  UserId,
} from "@/domain";

export interface SubjectRepository {
  findById(userId: UserId, id: EntityId): Promise<Subject | null>;
  list(userId: UserId): Promise<readonly Subject[]>;
}

export interface ChapterRepository {
  findById(userId: UserId, id: EntityId): Promise<Chapter | null>;
  listBySubject(
    userId: UserId,
    subjectId: EntityId,
  ): Promise<readonly Chapter[]>;
}

export interface KnowledgePointRepository {
  findById(userId: UserId, id: EntityId): Promise<KnowledgePoint | null>;
  listBySubject(
    userId: UserId,
    subjectId: EntityId,
  ): Promise<readonly KnowledgePoint[]>;
  listByChapter(
    userId: UserId,
    chapterId: EntityId,
  ): Promise<readonly KnowledgePoint[]>;
}

export interface PlanRepository {
  findById(userId: UserId, id: EntityId): Promise<Plan | null>;
  list(userId: UserId): Promise<readonly Plan[]>;
  listActiveOnDate(
    userId: UserId,
    date: ISODateString,
  ): Promise<readonly Plan[]>;
}

export interface TaskRepository {
  findById(userId: UserId, id: EntityId): Promise<Task | null>;
  listByPlan(userId: UserId, planId: EntityId): Promise<readonly Task[]>;
  listByDate(userId: UserId, date: ISODateString): Promise<readonly Task[]>;
}

export interface StudySessionRepository {
  findById(userId: UserId, id: EntityId): Promise<StudySession | null>;
  listByDate(
    userId: UserId,
    date: ISODateString,
  ): Promise<readonly StudySession[]>;
  listRecent(
    userId: UserId,
    limit: number,
  ): Promise<readonly StudySession[]>;
}

export interface ReviewRepository {
  findById(userId: UserId, id: EntityId): Promise<Review | null>;
  listScheduledForDate(
    userId: UserId,
    date: ISODateString,
  ): Promise<readonly Review[]>;
  listDueThroughDate(
    userId: UserId,
    date: ISODateString,
  ): Promise<readonly Review[]>;
}

export interface QuestionRepository {
  findById(userId: UserId, id: EntityId): Promise<Question | null>;
  listBySubject(
    userId: UserId,
    subjectId: EntityId,
  ): Promise<readonly Question[]>;
  listByQuestionBank(
    userId: UserId,
    questionBankId: EntityId,
  ): Promise<readonly Question[]>;
}

export interface QuestionBankRepository {
  findById(userId: UserId, id: EntityId): Promise<QuestionBank | null>;
  listBySubject(
    userId: UserId,
    subjectId: EntityId,
  ): Promise<readonly QuestionBank[]>;
}

export interface ExamPaperRepository {
  findById(userId: UserId, id: EntityId): Promise<ExamPaper | null>;
  listBySubject(
    userId: UserId,
    subjectId: EntityId,
  ): Promise<readonly ExamPaper[]>;
}

export interface CoreLearningRepositories {
  subjects: SubjectRepository;
  chapters: ChapterRepository;
  knowledgePoints: KnowledgePointRepository;
  plans: PlanRepository;
  tasks: TaskRepository;
  studySessions: StudySessionRepository;
  reviews: ReviewRepository;
  questions: QuestionRepository;
  questionBanks: QuestionBankRepository;
  examPapers: ExamPaperRepository;
}
