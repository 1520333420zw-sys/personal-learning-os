import type { CoreLearningDataContext } from "@/data";
import type { NewsRepository } from "@/data";
import type { StudySession, Subject } from "@/domain";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { toLocalDateKey } from "@/lib/date";

import type { HomeDashboardData, HomeSubjectViewModel } from "../types";
import { StudyTargetPresenter } from "./target-presenter";
import { NewsService } from "./news-service";

const subjectRoutes: Record<string, string> = {
  "psychology-312": "/psychology",
  politics: "/politics",
  english: "/vocabulary",
};

export class HomeDashboardService {
  constructor(
    private readonly context: CoreLearningDataContext,
    private readonly locale: Locale,
    private readonly dictionary: Dictionary,
    private readonly newsRepository: NewsRepository,
  ) {}

  async getDashboard(referenceDate = new Date()): Promise<HomeDashboardData> {
    const { userId, queries, repositories } = this.context;
    const today = toLocalDateKey(referenceDate);
    const [overview, tasks, reviews, subjects, recentSessions, todaySessions] =
      await Promise.all([
        queries.getTodayOverview(userId, referenceDate),
        queries.getTodayTasks(userId, referenceDate),
        queries.getTodayReviews(userId, referenceDate),
        repositories.subjects.list(userId),
        queries.getRecentStudySessions(userId, 5),
        repositories.studySessions.listByDate(userId, today),
      ]);
    const messages = this.dictionary.home;
    const presenter = new StudyTargetPresenter(repositories, userId, messages);
    const subjectNames = new Map(
      subjects.map((subject) => [subject.id, presenter.subjectName(subject.id)]),
    );

    return {
      dateLabel: new Intl.DateTimeFormat(this.locale, {
        month: "long",
        day: "numeric",
        weekday: "long",
      }).format(referenceDate),
      overview,
      tasks: await Promise.all(
        tasks.slice(0, 5).map(async (task) => ({
          id: task.id,
          title: this.taskTitle(task.id, task.title),
          targetType:
            (task.subjectId && subjectNames.get(task.subjectId)) ||
            messages.targetType[task.target.type],
          estimatedMinutes: task.estimatedMinutes,
          priority: task.priority,
          status: task.status,
        })),
      ),
      reviews: await Promise.all(
        reviews.map(async (review) => ({
          id: review.id,
          title: messages.reviewType[review.reviewType],
          targetLabel: await presenter.resolve(review.target),
          reviewType: review.reviewType,
          status: review.status,
          timing: review.scheduledFor < today ? "overdue" : "today",
          scheduledLabel: new Intl.DateTimeFormat(this.locale, {
            month: "short",
            day: "numeric",
          }).format(new Date(`${review.scheduledFor}T12:00:00`)),
        })),
      ),
      subjects: await Promise.all(
        subjects.map((subject) =>
          this.toSubjectViewModel(subject, todaySessions, recentSessions, presenter),
        ),
      ),
      recentSessions: await Promise.all(
        recentSessions.map(async (session) => ({
          id: session.id,
          subjectName: presenter.subjectName(session.subjectId),
          targetLabel: await presenter.resolve(session.target),
          sessionType: session.sessionType,
          durationMinutes: session.durationMinutes,
          startedAtLabel: new Intl.DateTimeFormat(this.locale, {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(session.startedAt)),
        })),
      ),
      news: await new NewsService(
        this.newsRepository,
        this.locale,
        messages,
      ).getHomeSummary(),
    };
  }

  private async toSubjectViewModel(
    subject: Subject,
    todaySessions: readonly StudySession[],
    recentSessions: readonly StudySession[],
    presenter: StudyTargetPresenter,
  ): Promise<HomeSubjectViewModel> {
    const chapters = await this.context.repositories.chapters.listBySubject(
      this.context.userId,
      subject.id,
    );
    const sessionsToday = todaySessions.filter(
      (session) => session.subjectId === subject.id && session.status === "completed",
    );
    const latest = recentSessions.find((session) => session.subjectId === subject.id);

    return {
      id: subject.id,
      name: presenter.subjectName(subject.id),
      href: `/${this.locale}${subjectRoutes[subject.slug] ?? "/plan"}`,
      chapterCount: chapters.length,
      todayMinutes: sessionsToday.reduce(
        (total, session) => total + session.durationMinutes,
        0,
      ),
      lastStudiedLabel: latest
        ? new Intl.DateTimeFormat(this.locale, {
            month: "short",
            day: "numeric",
          }).format(new Date(latest.startedAt))
        : this.dictionary.home.subject.notStarted,
    };
  }

  private taskTitle(id: string, fallback: string) {
    const demoKey = {
      "task-psychology-today": "psychology",
      "task-politics-today": "politics",
      "task-vocabulary-today": "vocabulary",
      "task-reading-tomorrow": "reading",
    }[id] as keyof Dictionary["studyPlan"]["demoTasks"] | undefined;

    return demoKey
      ? this.dictionary.studyPlan.demoTasks[demoKey].title
      : fallback.replace(/^Demo · /, "");
  }
}
