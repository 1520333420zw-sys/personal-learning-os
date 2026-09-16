import type {
  Chapter,
  CreateTaskInput,
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
  UpdateTaskInput,
  UserId,
} from "@/domain";
import type {
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
} from "@/data/contracts";
import { toLocalDateKey } from "@/lib/date";
import type { CoreLearningFixtures } from "@/mocks/fixtures";

function copy<T>(value: T): T {
  return structuredClone(value);
}

function belongsToUser<T extends { userId: UserId }>(
  item: T,
  userId: UserId,
): boolean {
  return item.userId === userId;
}

export class MockSubjectRepository implements SubjectRepository {
  constructor(private readonly subjects: readonly Subject[]) {}

  async findById(userId: UserId, id: EntityId) {
    const subject = this.subjects.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return subject ? copy(subject) : null;
  }

  async list(userId: UserId) {
    return copy(
      this.subjects
        .filter((item) => belongsToUser(item, userId))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  }
}

export class MockChapterRepository implements ChapterRepository {
  constructor(private readonly chapters: readonly Chapter[]) {}

  async findById(userId: UserId, id: EntityId) {
    const chapter = this.chapters.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return chapter ? copy(chapter) : null;
  }

  async listBySubject(userId: UserId, subjectId: EntityId) {
    return copy(
      this.chapters
        .filter(
          (item) =>
            belongsToUser(item, userId) && item.subjectId === subjectId,
        )
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  }
}

export class MockKnowledgePointRepository
  implements KnowledgePointRepository
{
  constructor(private readonly knowledgePoints: readonly KnowledgePoint[]) {}

  async findById(userId: UserId, id: EntityId) {
    const knowledgePoint = this.knowledgePoints.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return knowledgePoint ? copy(knowledgePoint) : null;
  }

  async listBySubject(userId: UserId, subjectId: EntityId) {
    return copy(
      this.knowledgePoints.filter(
        (item) =>
          belongsToUser(item, userId) && item.subjectId === subjectId,
      ),
    );
  }

  async listByChapter(userId: UserId, chapterId: EntityId) {
    return copy(
      this.knowledgePoints.filter(
        (item) =>
          belongsToUser(item, userId) && item.chapterId === chapterId,
      ),
    );
  }
}

export class MockPlanRepository implements PlanRepository {
  constructor(private readonly plans: readonly Plan[]) {}

  async findById(userId: UserId, id: EntityId) {
    const plan = this.plans.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return plan ? copy(plan) : null;
  }

  async list(userId: UserId) {
    return copy(this.plans.filter((item) => belongsToUser(item, userId)));
  }

  async listActiveOnDate(userId: UserId, date: ISODateString) {
    return copy(
      this.plans.filter(
        (item) =>
          belongsToUser(item, userId) &&
          item.status === "active" &&
          item.startDate <= date &&
          item.endDate >= date,
      ),
    );
  }
}

export class MockTaskRepository implements TaskRepository {
  private tasks: Task[];

  constructor(tasks: readonly Task[]) {
    this.tasks = tasks.map((task) => copy(task));
  }

  async findById(userId: UserId, id: EntityId) {
    const task = this.tasks.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return task ? copy(task) : null;
  }

  async list(userId: UserId) {
    return copy(this.tasks.filter((item) => belongsToUser(item, userId)));
  }

  async listByPlan(userId: UserId, planId: EntityId) {
    return copy(
      this.tasks.filter(
        (item) => belongsToUser(item, userId) && item.planId === planId,
      ),
    );
  }

  async listByDate(userId: UserId, date: ISODateString) {
    return copy(
      this.tasks.filter(
        (item) =>
          belongsToUser(item, userId) && item.scheduledDate === date,
      ),
    );
  }

  async create(userId: UserId, input: CreateTaskInput) {
    const now = new Date().toISOString();
    const task: Task = {
      ...copy(input),
      id: `task-${crypto.randomUUID()}`,
      userId,
      createdAt: now,
      updatedAt: now,
      revision: 1,
      status: "todo",
    };

    this.tasks.push(task);
    return copy(task);
  }

  async update(userId: UserId, id: EntityId, input: UpdateTaskInput) {
    const index = this.tasks.findIndex(
      (item) => belongsToUser(item, userId) && item.id === id,
    );

    if (index < 0) return null;

    const updated: Task = {
      ...this.tasks[index],
      ...copy(input),
      updatedAt: new Date().toISOString(),
      revision: this.tasks[index].revision + 1,
    };

    this.tasks[index] = updated;
    return copy(updated);
  }

  async delete(userId: UserId, id: EntityId) {
    const index = this.tasks.findIndex(
      (item) => belongsToUser(item, userId) && item.id === id,
    );

    if (index < 0) return false;
    this.tasks.splice(index, 1);
    return true;
  }
}

export class MockStudySessionRepository
  implements StudySessionRepository
{
  constructor(private readonly sessions: readonly StudySession[]) {}

  async findById(userId: UserId, id: EntityId) {
    const session = this.sessions.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return session ? copy(session) : null;
  }

  async listByDate(userId: UserId, date: ISODateString) {
    return copy(
      this.sessions.filter(
        (item) =>
          belongsToUser(item, userId) &&
          toLocalDateKey(new Date(item.startedAt)) === date,
      ),
    );
  }

  async listRecent(userId: UserId, limit: number) {
    return copy(
      this.sessions
        .filter((item) => belongsToUser(item, userId))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .slice(0, Math.max(0, limit)),
    );
  }
}

export class MockReviewRepository implements ReviewRepository {
  constructor(private readonly reviews: readonly Review[]) {}

  async findById(userId: UserId, id: EntityId) {
    const review = this.reviews.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return review ? copy(review) : null;
  }

  async listScheduledForDate(userId: UserId, date: ISODateString) {
    return copy(
      this.reviews.filter(
        (item) =>
          belongsToUser(item, userId) && item.scheduledFor === date,
      ),
    );
  }

  async listDueThroughDate(userId: UserId, date: ISODateString) {
    return copy(
      this.reviews.filter(
        (item) =>
          belongsToUser(item, userId) &&
          item.status === "pending" &&
          item.scheduledFor <= date,
      ),
    );
  }
}

export class MockQuestionRepository implements QuestionRepository {
  constructor(private readonly questions: readonly Question[]) {}

  async findById(userId: UserId, id: EntityId) {
    const question = this.questions.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return question ? copy(question) : null;
  }

  async listBySubject(userId: UserId, subjectId: EntityId) {
    return copy(
      this.questions.filter(
        (item) =>
          belongsToUser(item, userId) && item.subjectId === subjectId,
      ),
    );
  }

  async listByQuestionBank(userId: UserId, questionBankId: EntityId) {
    return copy(
      this.questions.filter(
        (item) =>
          belongsToUser(item, userId) &&
          item.questionBankId === questionBankId,
      ),
    );
  }
}

export class MockQuestionBankRepository
  implements QuestionBankRepository
{
  constructor(private readonly questionBanks: readonly QuestionBank[]) {}

  async findById(userId: UserId, id: EntityId) {
    const questionBank = this.questionBanks.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return questionBank ? copy(questionBank) : null;
  }

  async listBySubject(userId: UserId, subjectId: EntityId) {
    return copy(
      this.questionBanks.filter(
        (item) =>
          belongsToUser(item, userId) && item.subjectId === subjectId,
      ),
    );
  }
}

export class MockExamPaperRepository implements ExamPaperRepository {
  constructor(private readonly examPapers: readonly ExamPaper[]) {}

  async findById(userId: UserId, id: EntityId) {
    const examPaper = this.examPapers.find(
      (item) => belongsToUser(item, userId) && item.id === id,
    );
    return examPaper ? copy(examPaper) : null;
  }

  async listBySubject(userId: UserId, subjectId: EntityId) {
    return copy(
      this.examPapers.filter(
        (item) =>
          belongsToUser(item, userId) && item.subjectId === subjectId,
      ),
    );
  }
}

export function createMockLearningRepositories(
  fixtures: CoreLearningFixtures,
): CoreLearningRepositories {
  return {
    subjects: new MockSubjectRepository(fixtures.subjects),
    chapters: new MockChapterRepository(fixtures.chapters),
    knowledgePoints: new MockKnowledgePointRepository(
      fixtures.knowledgePoints,
    ),
    plans: new MockPlanRepository(fixtures.plans),
    tasks: new MockTaskRepository(fixtures.tasks),
    studySessions: new MockStudySessionRepository(fixtures.studySessions),
    reviews: new MockReviewRepository(fixtures.reviews),
    questions: new MockQuestionRepository(fixtures.questions),
    questionBanks: new MockQuestionBankRepository(fixtures.questionBanks),
    examPapers: new MockExamPaperRepository(fixtures.examPapers),
  };
}
