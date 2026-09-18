export type ExternalWrite =
  | { type: "study_session"; date: string; durationMinutes: number; subjectId?: string; chapterId?: string; sessionType: "learning" | "review" | "practice" | "recitation" | "reading"; itemCount?: number; incorrectCount?: number }
  | { type: "task"; title: string; date: string; plannedMinutes: number; subjectId?: string; chapterId?: string; description?: string; priority: "low" | "medium" | "high" }
  | { type: "recitation"; title: string; content: string; subjectId?: string; chapterId?: string; category?: string; nextReviewAt?: string }
  | { type: "reading"; title: string; source?: string; url?: string; publishedDate?: string; category?: string; notes?: string; summary?: string }
  | { type: "wrong_question"; questionId: string };

export interface ExternalWriteReceipt {
  id: string;
  status: "pending" | "applied" | "revoke_requested" | "reverted" | "cancelled";
  command: ExternalWrite;
  createdAt: string;
}

type Fields = Record<string, unknown>;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function record(value: unknown): value is Fields {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function exact(value: Fields, keys: string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}
function string(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}
function optionalString(value: unknown, max: number): value is string | undefined {
  return value === undefined || string(value, max);
}
function date(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function optionalDate(value: unknown): value is string | undefined {
  return value === undefined || date(value);
}
function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}
function optionalInteger(value: unknown, min: number, max: number): value is number | undefined {
  return value === undefined || integer(value, min, max);
}
function httpUrl(value: unknown): boolean {
  if (value === undefined) return true;
  if (!string(value, 2048)) return false;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}

export function parseExternalWrite(value: unknown): ExternalWrite | null {
  if (!record(value)) return null;
  const { type } = value;
  if (type === "study_session") {
    if (!exact(value, ["type", "date", "durationMinutes", "subjectId", "chapterId", "sessionType", "itemCount", "incorrectCount"]) ||
      !date(value.date) || !integer(value.durationMinutes, 0, 480) ||
      !optionalString(value.subjectId, 120) || !optionalString(value.chapterId, 120) ||
      !["learning", "review", "practice", "recitation", "reading"].includes(String(value.sessionType)) ||
      !optionalInteger(value.itemCount, 1, 10000) || !optionalInteger(value.incorrectCount, 1, 10000) ||
      (value.durationMinutes === 0 && value.itemCount === undefined && value.incorrectCount === undefined)) return null;
    return value as ExternalWrite;
  }
  if (type === "task") {
    if (!exact(value, ["type", "title", "date", "plannedMinutes", "subjectId", "chapterId", "description", "priority"]) ||
      !string(value.title, 200) || !date(value.date) || !integer(value.plannedMinutes, 5, 480) ||
      !optionalString(value.subjectId, 120) || !optionalString(value.chapterId, 120) || !optionalString(value.description, 2000) ||
      !["low", "medium", "high"].includes(String(value.priority))) return null;
    return value as ExternalWrite;
  }
  if (type === "recitation") {
    if (!exact(value, ["type", "title", "content", "subjectId", "chapterId", "category", "nextReviewAt"]) ||
      !string(value.title, 200) || !string(value.content, 5000) || !optionalString(value.subjectId, 120) ||
      !optionalString(value.chapterId, 120) || !optionalString(value.category, 120) || !optionalDate(value.nextReviewAt)) return null;
    return value as ExternalWrite;
  }
  if (type === "reading") {
    if (!exact(value, ["type", "title", "source", "url", "publishedDate", "category", "notes", "summary"]) ||
      !string(value.title, 300) || !optionalString(value.source, 200) || !httpUrl(value.url) ||
      !optionalDate(value.publishedDate) || !optionalString(value.category, 120) || !optionalString(value.notes, 5000) ||
      !optionalString(value.summary, 5000)) return null;
    return value as ExternalWrite;
  }
  if (type === "wrong_question") {
    if (!exact(value, ["type", "questionId"]) || !string(value.questionId, 120)) return null;
    return value as ExternalWrite;
  }
  return null;
}
