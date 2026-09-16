export type OwnerId = string;
export type BetaId = string;

export interface BetaEntity { id: BetaId; ownerId: OwnerId; createdAt: string; updatedAt: string; }
export interface BetaSubject extends BetaEntity { slug: "psychology" | "politics" | "english"; name: string; nameEn: string; }
export interface BetaChapter extends BetaEntity { subjectId: BetaId; title: string; titleEn: string; order: number; }
export type Mastery = "new" | "learning" | "reviewing" | "mastered";
export interface BetaKnowledgePoint extends BetaEntity {
  subjectId: BetaId; chapterId: BetaId; title: string; titleEn: string;
  coreConcept: string; keyPoints: string; pitfalls: string; personalNote: string;
  mastery: Mastery; favorite: boolean; lastStudiedAt?: string; nextReviewAt?: string;
}
export type BetaTaskStatus = "todo" | "in_progress" | "completed";
export type BetaTaskPriority = "low" | "medium" | "high";
export interface BetaTask extends BetaEntity {
  title: string; description: string; subjectId?: BetaId; chapterId?: BetaId; date: string;
  plannedMinutes: number; actualMinutes: number; priority: BetaTaskPriority; status: BetaTaskStatus;
  completedAt?: string; sourceType: "manual" | "review" | "system";
}
export interface BetaStudySession extends BetaEntity {
  subjectId?: BetaId; taskId?: BetaId; startedAt: string; endedAt: string; durationMinutes: number;
  sessionType: "learning" | "review" | "practice" | "recitation" | "reading"; completed: boolean;
}
export interface BetaPomodoroSession extends BetaEntity {
  subjectId?: BetaId; taskId?: BetaId; startedAt: string; endedAt: string;
  durationMinutes: number; completed: boolean;
}
export interface BetaStudyProgress extends BetaEntity {
  targetType: "subject" | "chapter" | "knowledge"; targetId: BetaId;
  status: Mastery; percent: number;
}
export type ReviewKind = "knowledge" | "question" | "vocabulary" | "recitation";
export interface BetaReviewItem extends BetaEntity {
  kind: ReviewKind; targetId: BetaId; title: string; dueDate: string;
  status: "due" | "completed" | "mastered"; completedAt?: string;
}
export type BetaQuestionType = "single" | "multiple" | "true_false";
export interface BetaQuestion extends BetaEntity {
  subjectId: BetaId; chapterId?: BetaId; knowledgePointId?: BetaId; examType: string;
  questionType: BetaQuestionType; stem: string; options: { id: string; text: string }[];
  answer: string[]; explanation: string; difficulty: "easy" | "medium" | "hard";
  source: string; tags: string[];
}
export interface BetaQuestionAttempt extends BetaEntity { questionId: BetaId; answer: string[]; correct: boolean; attemptedAt: string; }
export interface BetaWrongQuestion extends BetaEntity { questionId: BetaId; mastered: boolean; lastAttemptAt: string; }
export interface BetaFavorite extends BetaEntity {
  targetType: "question" | "knowledge" | "vocabulary" | "book" | "note" | "resource" | "recitation" | "reading";
  targetId: BetaId;
}
export interface BetaVocabulary extends BetaEntity {
  word: string; phonetic: string; meaning: string; example: string;
  examType: "english1" | "english2" | "cet4" | "cet6" | "general";
  familiarity: "new" | "vague" | "known" | "mastered"; favorite: boolean;
  reviewCount: number; nextReviewAt?: string;
}
export interface BetaReading extends BetaEntity {
  title: string; source: string; url: string; publishedDate: string; category: string;
  status: "unread" | "reading" | "finished"; favorite: boolean; excerpt: string;
  notes: string; summary: string; vocabulary: string[];
}
export interface BetaReadingNote extends BetaEntity { readingId: BetaId; content: string; excerpt: string; }
export interface BetaRecitation extends BetaEntity {
  title: string; category: string; content: string; status: "today" | "review" | "mastered";
  favorite: boolean; nextReviewAt?: string;
}
export interface BetaNote extends BetaEntity {
  title: string; content: string; tags: string[]; subjectId?: BetaId;
  linkedType?: string; linkedId?: BetaId; favorite: boolean;
}
export interface BetaBook extends BetaEntity {
  title: string; author: string; status: "want" | "reading" | "finished"; progress: number;
  startDate?: string; finishDate?: string; rating?: number; notes: string; favorite: boolean;
}
export interface BetaResource extends BetaEntity {
  name: string; url: string; category: "website" | "course" | "youtube" | "podcast" | "tool" | "article";
  examCategory: string; description: string; tags: string[]; favorite: boolean;
}
export interface BetaHabit extends BetaEntity { name: string; date: string; completed: boolean; }
export interface BetaExercise extends BetaEntity { date: string; activity: string; minutes: number; notes: string; }
export interface BetaSleep extends BetaEntity { date: string; hours: number; quality: 1 | 2 | 3 | 4 | 5; }
export interface BetaFinanceEntry extends BetaEntity { date: string; type: "income" | "expense"; amount: number; category: string; note: string; }
export interface BetaGoal extends BetaEntity { title: string; milestone: string; status: "active" | "completed" | "paused"; dueDate: string; progress: number; }
export interface BetaPomodoroRuntime {
  id: BetaId; subjectId?: BetaId; taskId?: BetaId; durationMinutes: number; startedAt: string;
  targetEndAt?: string; remainingSeconds: number; status: "running" | "paused";
}
export interface BetaState {
  version: 1; ownerId: OwnerId; subjects: BetaSubject[]; chapters: BetaChapter[];
  knowledgePoints: BetaKnowledgePoint[]; tasks: BetaTask[]; studySessions: BetaStudySession[];
  pomodoroSessions: BetaPomodoroSession[]; studyProgress: BetaStudyProgress[];
  reviewItems: BetaReviewItem[]; questions: BetaQuestion[]; questionAttempts: BetaQuestionAttempt[];
  wrongQuestions: BetaWrongQuestion[]; favorites: BetaFavorite[]; vocabulary: BetaVocabulary[];
  reading: BetaReading[]; readingNotes: BetaReadingNote[]; recitations: BetaRecitation[]; notes: BetaNote[]; books: BetaBook[];
  resources: BetaResource[]; habits: BetaHabit[]; exercises: BetaExercise[]; sleep: BetaSleep[];
  finance: BetaFinanceEntry[]; goals: BetaGoal[]; pomodoroRuntime?: BetaPomodoroRuntime;
}
