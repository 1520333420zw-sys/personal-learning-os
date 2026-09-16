import type {
  Chapter,
  EntityBase,
  ExamPaper,
  KnowledgePoint,
  Plan,
  PomodoroSession,
  Question,
  QuestionAttempt,
  QuestionBank,
  Review,
  StudySession,
  Subject,
  Task,
  UserId,
} from "@/domain";
import { addLocalDays, toLocalDateKey, toLocalDateTime } from "@/lib/date";

export const DEMO_USER_ID: UserId = "user-demo";

export interface CoreLearningFixtures {
  subjects: readonly Subject[];
  chapters: readonly Chapter[];
  knowledgePoints: readonly KnowledgePoint[];
  plans: readonly Plan[];
  tasks: readonly Task[];
  studySessions: readonly StudySession[];
  pomodoroSessions: readonly PomodoroSession[];
  reviews: readonly Review[];
  questionBanks: readonly QuestionBank[];
  questions: readonly Question[];
  questionAttempts: readonly QuestionAttempt[];
  examPapers: readonly ExamPaper[];
}

function entityBase(id: string, timestamp: string): EntityBase {
  return {
    id,
    userId: DEMO_USER_ID,
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: 1,
  };
}

export function createCoreLearningFixtures(
  referenceDate = new Date(),
): CoreLearningFixtures {
  const today = toLocalDateKey(referenceDate);
  const tomorrow = addLocalDays(today, 1);
  const nextWeek = addLocalDays(today, 7);
  const createdAt = toLocalDateTime(today, 7);

  const subjects = [
    {
      ...entityBase("subject-psychology-312", createdAt),
      name: "312 Psychology",
      slug: "psychology-312",
      category: "professional",
      description: "Demo subject structure for postgraduate psychology study.",
      status: "active",
      sortOrder: 1,
    },
    {
      ...entityBase("subject-politics", createdAt),
      name: "Politics",
      slug: "politics",
      category: "politics",
      description: "Demo subject structure for political theory and current affairs.",
      status: "active",
      sortOrder: 2,
    },
    {
      ...entityBase("subject-english", createdAt),
      name: "English",
      slug: "english",
      category: "language",
      description: "Shared subject for vocabulary, reading, and English practice.",
      status: "active",
      sortOrder: 3,
    },
  ] satisfies readonly Subject[];

  const chapters = [
    {
      ...entityBase("chapter-psych-general", createdAt),
      subjectId: "subject-psychology-312",
      title: "普通心理学",
      description: "Demo chapter",
      sortOrder: 1,
      status: "in_progress",
    },
    {
      ...entityBase("chapter-psych-development", createdAt),
      subjectId: "subject-psychology-312",
      title: "发展心理学",
      description: "Demo chapter",
      sortOrder: 2,
      status: "not_started",
    },
    {
      ...entityBase("chapter-psych-education", createdAt),
      subjectId: "subject-psychology-312",
      title: "教育心理学",
      description: "Demo chapter",
      sortOrder: 3,
      status: "not_started",
    },
    {
      ...entityBase("chapter-politics-marxism", createdAt),
      subjectId: "subject-politics",
      title: "马克思主义基本原理",
      description: "Demo chapter",
      sortOrder: 1,
      status: "in_progress",
    },
    {
      ...entityBase("chapter-politics-mao", createdAt),
      subjectId: "subject-politics",
      title: "毛泽东思想和中国特色社会主义理论体系",
      description: "Demo chapter",
      sortOrder: 2,
      status: "not_started",
    },
    {
      ...entityBase("chapter-politics-history", createdAt),
      subjectId: "subject-politics",
      title: "中国近现代史纲要",
      description: "Demo chapter",
      sortOrder: 3,
      status: "not_started",
    },
    {
      ...entityBase("chapter-politics-ethics-law", createdAt),
      subjectId: "subject-politics",
      title: "思想道德与法治",
      description: "Demo chapter",
      sortOrder: 4,
      status: "not_started",
    },
    {
      ...entityBase("chapter-politics-current-affairs", createdAt),
      subjectId: "subject-politics",
      title: "形势与政策 / 当代世界经济与政治",
      description: "Demo chapter",
      sortOrder: 5,
      status: "not_started",
    },
    {
      ...entityBase("chapter-english-vocabulary", createdAt),
      subjectId: "subject-english",
      title: "Vocabulary",
      description: "Demo chapter for shared English vocabulary.",
      sortOrder: 1,
      status: "in_progress",
    },
    {
      ...entityBase("chapter-english-reading", createdAt),
      subjectId: "subject-english",
      title: "Reading",
      description: "Demo chapter for shared English reading.",
      sortOrder: 2,
      status: "not_started",
    },
  ] satisfies readonly Chapter[];

  const knowledgePoints = [
    {
      ...entityBase("knowledge-psych-demo-1", createdAt),
      subjectId: "subject-psychology-312",
      chapterId: "chapter-psych-general",
      title: "Demo · 普通心理学知识点",
      summary: "用于验证知识点结构的示例。",
      status: "in_progress",
      masteryLevel: "learning",
    },
    {
      ...entityBase("knowledge-politics-demo-1", createdAt),
      subjectId: "subject-politics",
      chapterId: "chapter-politics-marxism",
      title: "Demo · 政治知识点",
      summary: "用于验证政治知识点结构的示例。",
      status: "not_started",
      masteryLevel: "new",
    },
  ] satisfies readonly KnowledgePoint[];

  const plans = [
    {
      ...entityBase("plan-current-study-cycle", createdAt),
      title: "Demo · Current study cycle",
      description: "A small fixture used to validate planning queries.",
      startDate: today,
      endDate: nextWeek,
      status: "active",
    },
  ] satisfies readonly Plan[];

  const tasks = [
    {
      ...entityBase("task-psychology-today", createdAt),
      planId: "plan-current-study-cycle",
      title: "Demo · Review general psychology",
      description: "Review one demo knowledge point.",
      subjectId: "subject-psychology-312",
      scheduledDate: today,
      status: "in_progress",
      priority: "high",
      estimatedMinutes: 50,
      target: {
        type: "knowledgePoint",
        subjectId: "subject-psychology-312",
        chapterId: "chapter-psych-general",
        knowledgePointId: "knowledge-psych-demo-1",
      },
      sourceType: "study_plan",
    },
    {
      ...entityBase("task-politics-today", createdAt),
      planId: "plan-current-study-cycle",
      title: "Demo · Politics chapter study",
      description: "Open the demo Politics chapter.",
      subjectId: "subject-politics",
      scheduledDate: today,
      status: "todo",
      priority: "medium",
      estimatedMinutes: 40,
      target: {
        type: "chapter",
        subjectId: "subject-politics",
        chapterId: "chapter-politics-marxism",
      },
      sourceType: "study_plan",
    },
    {
      ...entityBase("task-vocabulary-today", createdAt),
      planId: "plan-current-study-cycle",
      title: "Demo · Vocabulary review",
      description: "Review the small demo vocabulary queue.",
      subjectId: "subject-english",
      scheduledDate: today,
      status: "todo",
      priority: "medium",
      estimatedMinutes: 20,
      target: {
        type: "vocabulary",
        vocabularyItemId: "vocabulary-demo-1",
      },
      sourceType: "review",
    },
    {
      ...entityBase("task-reading-tomorrow", createdAt),
      planId: "plan-current-study-cycle",
      title: "Demo · English reading",
      description: "Read a future demo article.",
      subjectId: "subject-english",
      scheduledDate: tomorrow,
      status: "todo",
      priority: "low",
      estimatedMinutes: 30,
      target: { type: "reading", articleId: "article-demo-1" },
      sourceType: "study_plan",
    },
  ] satisfies readonly Task[];

  const studySessions = [
    {
      ...entityBase("study-session-psychology", createdAt),
      subjectId: "subject-psychology-312",
      taskId: "task-psychology-today",
      target: {
        type: "knowledgePoint",
        subjectId: "subject-psychology-312",
        chapterId: "chapter-psych-general",
        knowledgePointId: "knowledge-psych-demo-1",
      },
      startedAt: toLocalDateTime(today, 8),
      endedAt: toLocalDateTime(today, 8, 50),
      durationMinutes: 50,
      sessionType: "learning",
      status: "completed",
      notes: "Demo session",
    },
    {
      ...entityBase("study-session-politics", createdAt),
      subjectId: "subject-politics",
      target: {
        type: "chapter",
        subjectId: "subject-politics",
        chapterId: "chapter-politics-marxism",
      },
      startedAt: toLocalDateTime(today, 10),
      endedAt: toLocalDateTime(today, 10, 25),
      durationMinutes: 25,
      sessionType: "review",
      status: "completed",
      notes: "Demo session",
    },
    {
      ...entityBase("study-session-english", createdAt),
      subjectId: "subject-english",
      target: { type: "reading", articleId: "article-demo-1" },
      startedAt: toLocalDateTime(today, 14),
      endedAt: toLocalDateTime(today, 14, 35),
      durationMinutes: 35,
      sessionType: "reading",
      status: "completed",
      notes: "Demo session",
    },
  ] satisfies readonly StudySession[];

  const pomodoroSessions = [
    {
      ...entityBase("pomodoro-session-demo", createdAt),
      studySessionId: "study-session-politics",
      category: "politics",
      startedAt: toLocalDateTime(today, 10),
      endsAt: toLocalDateTime(today, 10, 25),
      status: "completed",
    },
  ] satisfies readonly PomodoroSession[];

  const reviews = [
    {
      ...entityBase("review-vocabulary-today", createdAt),
      target: {
        type: "vocabulary",
        vocabularyItemId: "vocabulary-demo-1",
      },
      scheduledFor: today,
      status: "pending",
      reviewType: "vocabulary",
    },
    {
      ...entityBase("review-knowledge-today", createdAt),
      target: {
        type: "knowledgePoint",
        subjectId: "subject-psychology-312",
        chapterId: "chapter-psych-general",
        knowledgePointId: "knowledge-psych-demo-1",
      },
      scheduledFor: today,
      status: "pending",
      reviewType: "knowledgePoint",
    },
    {
      ...entityBase("review-politics-tomorrow", createdAt),
      target: {
        type: "knowledgePoint",
        subjectId: "subject-politics",
        chapterId: "chapter-politics-marxism",
        knowledgePointId: "knowledge-politics-demo-1",
      },
      scheduledFor: tomorrow,
      status: "pending",
      reviewType: "knowledgePoint",
    },
    {
      ...entityBase("review-question-today", createdAt),
      target: {
        type: "question",
        questionId: "question-psychology-demo",
        subjectId: "subject-psychology-312",
      },
      scheduledFor: today,
      status: "pending",
      reviewType: "question",
    },
  ] satisfies readonly Review[];

  const questionBanks = [
    {
      ...entityBase("question-bank-psychology-demo", createdAt),
      subjectId: "subject-psychology-312",
      title: "Demo · 312 shared question bank",
      description: "Structural fixture only.",
      source: { type: "mock", name: "Demo fixture" },
      status: "active",
    },
    {
      ...entityBase("question-bank-politics-demo", createdAt),
      subjectId: "subject-politics",
      title: "Demo · Politics shared question bank",
      description: "Structural fixture only.",
      source: { type: "mock", name: "Demo fixture" },
      status: "active",
    },
  ] satisfies readonly QuestionBank[];

  const questions = [
    {
      ...entityBase("question-psychology-demo", createdAt),
      subjectId: "subject-psychology-312",
      chapterId: "chapter-psych-general",
      knowledgePointId: "knowledge-psych-demo-1",
      questionBankId: "question-bank-psychology-demo",
      questionType: "single_choice",
      difficulty: "easy",
      source: { type: "mock", name: "Demo fixture" },
      stem: "Demo question used only to validate the shared question structure.",
      options: [
        { id: "a", text: "Demo option A" },
        { id: "b", text: "Demo option B" },
      ],
      answer: "a",
      explanation: "Demo explanation.",
      status: "active",
    },
    {
      ...entityBase("question-politics-demo", createdAt),
      subjectId: "subject-politics",
      chapterId: "chapter-politics-marxism",
      knowledgePointId: "knowledge-politics-demo-1",
      questionBankId: "question-bank-politics-demo",
      questionType: "true_false",
      difficulty: "easy",
      source: { type: "mock", name: "Demo fixture" },
      stem: "Demo Politics question used only to validate relationships.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" },
      ],
      answer: "true",
      explanation: "Demo explanation.",
      status: "active",
    },
  ] satisfies readonly Question[];

  const questionAttempts = [
    {
      ...entityBase("question-attempt-demo", createdAt),
      questionId: "question-psychology-demo",
      studySessionId: "study-session-psychology",
      answer: "a",
      isCorrect: true,
      attemptedAt: toLocalDateTime(today, 8, 40),
      durationSeconds: 45,
    },
  ] satisfies readonly QuestionAttempt[];

  const examPapers = [
    {
      ...entityBase("exam-paper-politics-demo", createdAt),
      subjectId: "subject-politics",
      title: "Demo · Politics practice paper",
      questionIds: ["question-politics-demo"],
      paperType: "practice",
      status: "draft",
    },
  ] satisfies readonly ExamPaper[];

  return {
    subjects,
    chapters,
    knowledgePoints,
    plans,
    tasks,
    studySessions,
    pomodoroSessions,
    reviews,
    questionBanks,
    questions,
    questionAttempts,
    examPapers,
  };
}
