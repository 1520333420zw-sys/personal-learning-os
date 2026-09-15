import type { ISODateString, StudySession, Task, UserId } from "@/domain";
import type {
  ReviewRepository,
  StudySessionRepository,
  TaskRepository,
} from "@/data/contracts";
import { toLocalDateKey } from "@/lib/date";

export interface LearningQueryDependencies {
  tasks: TaskRepository;
  reviews: ReviewRepository;
  studySessions: StudySessionRepository;
}

export class LearningQueryService {
  constructor(private readonly repositories: LearningQueryDependencies) {}

  getTodayTasks(
    userId: UserId,
    referenceDate = new Date(),
  ): Promise<readonly Task[]> {
    return this.repositories.tasks.listByDate(
      userId,
      toLocalDateKey(referenceDate),
    );
  }

  getTodayReviews(userId: UserId, referenceDate = new Date()) {
    return this.repositories.reviews.listDueThroughDate(
      userId,
      toLocalDateKey(referenceDate),
    );
  }

  getRecentStudySessions(
    userId: UserId,
    limit = 5,
  ): Promise<readonly StudySession[]> {
    return this.repositories.studySessions.listRecent(userId, limit);
  }

  async getStudyMinutesForDate(
    userId: UserId,
    date: ISODateString,
  ): Promise<number> {
    const sessions = await this.repositories.studySessions.listByDate(
      userId,
      date,
    );

    return sessions
      .filter((session) => session.status === "completed")
      .reduce((total, session) => total + session.durationMinutes, 0);
  }
}
