import type { BetaState } from "@/domain/beta";
import { addLocalDays } from "@/lib/date";

export interface DashboardAnalytics {
  today: {
    minutes: number; sessions: number; completedTasks: number; pendingTasks: number;
    recitations: number; reviews: number; wrongReviews: number;
    subjects: { subjectId?: string; minutes: number }[];
  };
  week: {
    days: { date: string; minutes: number; sessions: number }[];
    subjects: { subjectId?: string; minutes: number }[];
    completedTasks: number; totalTasks: number; completionRate: number;
  };
  month: {
    minutes: number; studyDays: number; streak: number;
    subjects: { subjectId?: string; minutes: number }[];
    mostStudiedSubjectId?: string; weakestSubjectId?: string;
  };
}

function sessionDate(value: string): string {
  const date = new Date(value); const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function bySubject(sessions: BetaState["studySessions"]) {
  const totals = new Map<string, number>();
  for (const session of sessions) {
    const key = session.subjectId ?? "";
    totals.set(key, (totals.get(key) ?? 0) + session.durationMinutes);
  }
  return [...totals].map(([subjectId, minutes]) => ({ subjectId: subjectId || undefined, minutes }))
    .sort((left, right) => right.minutes - left.minutes);
}

export function getDashboardAnalytics(state: BetaState, today: string): DashboardAnalytics {
  const completed = state.studySessions.filter((session) => session.completed);
  const todaySessions = completed.filter((session) => sessionDate(session.endedAt) === today);
  const todayTasks = state.tasks.filter((task) => task.date === today);
  const todayRecitations = state.recitations.filter((item) => item.status !== "mastered" && (!item.nextReviewAt || item.nextReviewAt <= today));
  const todayReviews = state.reviewItems.filter((item) => item.status === "due" && item.dueDate <= today);

  const weekStart = addLocalDays(today, -6);
  const weekSessions = completed.filter((session) => {
    const date = sessionDate(session.endedAt); return date >= weekStart && date <= today;
  });
  const weekTasks = state.tasks.filter((task) => task.date >= weekStart && task.date <= today);
  const days = Array.from({ length: 7 }, (_, index) => addLocalDays(weekStart, index)).map((date) => {
    const sessions = weekSessions.filter((session) => sessionDate(session.endedAt) === date);
    return { date, minutes: sessions.reduce((total, session) => total + session.durationMinutes, 0), sessions: sessions.length };
  });

  const monthPrefix = today.slice(0, 7);
  const monthSessions = completed.filter((session) => sessionDate(session.endedAt).startsWith(monthPrefix));
  const studiedDates = new Set(monthSessions.map((session) => sessionDate(session.endedAt)));
  let cursor = studiedDates.has(today) ? today : addLocalDays(today, -1); let streak = 0;
  while (studiedDates.has(cursor)) { streak += 1; cursor = addLocalDays(cursor, -1); }
  const monthSubjects = bySubject(monthSessions);

  const weakness = new Map<string, number>();
  for (const wrong of state.wrongQuestions.filter((item) => !item.mastered)) {
    const question = state.questions.find((item) => item.id === wrong.questionId);
    if (question) weakness.set(question.subjectId, (weakness.get(question.subjectId) ?? 0) + 3);
  }
  for (const point of state.knowledgePoints.filter((item) => item.mastery === "reviewing")) {
    weakness.set(point.subjectId, (weakness.get(point.subjectId) ?? 0) + 1);
  }
  const weakestSubjectId = [...weakness].sort((left, right) => right[1] - left[1])[0]?.[0];

  return {
    today: {
      minutes: todaySessions.reduce((total, session) => total + session.durationMinutes, 0), sessions: todaySessions.length,
      completedTasks: todayTasks.filter((task) => task.status === "completed").length,
      pendingTasks: todayTasks.filter((task) => task.status !== "completed").length,
      recitations: todayRecitations.length, reviews: todayReviews.length,
      wrongReviews: todayReviews.filter((item) => item.kind === "question").length,
      subjects: bySubject(todaySessions),
    },
    week: {
      days, subjects: bySubject(weekSessions), completedTasks: weekTasks.filter((task) => task.status === "completed").length,
      totalTasks: weekTasks.length,
      completionRate: weekTasks.length ? Math.round(weekTasks.filter((task) => task.status === "completed").length / weekTasks.length * 100) : 0,
    },
    month: {
      minutes: monthSessions.reduce((total, session) => total + session.durationMinutes, 0),
      studyDays: studiedDates.size, streak, subjects: monthSubjects,
      mostStudiedSubjectId: monthSubjects[0]?.subjectId, weakestSubjectId,
    },
  };
}
