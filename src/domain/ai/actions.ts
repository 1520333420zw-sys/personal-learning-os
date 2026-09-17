export type LearningAction =
  | { type: "createTask"; title: string; date: string; subjectId?: string; chapterId?: string; minutes: number }
  | { type: "createStudySession"; date: string; subjectId?: string; chapterId?: string; minutes: number }
  | { type: "createMemorizationItem"; title: string; content?: string; knowledgePointId?: string; subjectId?: string; chapterId?: string }
  | { type: "createNote"; title: string; content: string; subjectId?: string }
  | { type: "createExpense" | "createIncome"; date: string; amount: number; category: string; note: string }
  | { type: "createSleepRecord"; date: string; hours: number }
  | { type: "createExerciseRecord"; date: string; activity: string; minutes: number }
  | { type: "updateBookProgress"; bookId: string; progress: number }
  | { type: "addVocabulary"; word: string; meaning: string }
  | { type: "scheduleReview"; targetId: string; title: string; date: string };

const date = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
};
const string = (value: unknown, max = 500): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const optionalString = (value: unknown): value is string | undefined => value === undefined || string(value, 120);
const number = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;

export function parseLearningAction(value: unknown): LearningAction | null {
  if (!value || typeof value !== "object") return null;
  const a = value as Record<string, unknown>;
  switch (a.type) {
    case "createTask": if (string(a.title, 200) && date(a.date) && number(a.minutes, 5, 480) && optionalString(a.subjectId) && optionalString(a.chapterId)) return a as LearningAction; break;
    case "createStudySession": if (date(a.date) && number(a.minutes, 1, 480) && optionalString(a.subjectId) && optionalString(a.chapterId)) return a as LearningAction; break;
    case "createMemorizationItem": if (string(a.title, 200) && (string(a.content, 10000) || string(a.knowledgePointId, 120)) && optionalString(a.subjectId) && optionalString(a.chapterId)) return a as LearningAction; break;
    case "createNote": if (string(a.title, 200) && string(a.content, 20000) && optionalString(a.subjectId)) return a as LearningAction; break;
    case "createExpense": case "createIncome": if (date(a.date) && number(a.amount, 0.01, 100000000) && string(a.category, 80) && typeof a.note === "string" && a.note.length <= 500) return a as LearningAction; break;
    case "createSleepRecord": if (date(a.date) && number(a.hours, 0.1, 24)) return a as LearningAction; break;
    case "createExerciseRecord": if (date(a.date) && string(a.activity, 100) && number(a.minutes, 1, 1440)) return a as LearningAction; break;
    case "updateBookProgress": if (string(a.bookId, 120) && number(a.progress, 0, 100)) return a as LearningAction; break;
    case "addVocabulary": if (string(a.word, 100) && string(a.meaning, 500)) return a as LearningAction; break;
    case "scheduleReview": if (string(a.targetId, 120) && string(a.title, 200) && date(a.date)) return a as LearningAction; break;
  }
  return null;
}
