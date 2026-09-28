export interface MirroredStudySession {
  id: string;
  updatedAt: string;
  localDate: string;
  subjectId?: string;
  subjectName?: string;
  subjectNameEn?: string;
  chapterId?: string;
  chapterTitle?: string;
  chapterTitleEn?: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  sessionType: "learning" | "review" | "practice" | "recitation" | "reading";
  itemCount?: number;
  incorrectCount?: number;
}

export interface MirroredTask {
  id: string;
  updatedAt: string;
  date: string;
  title: string;
  subjectId?: string;
  subjectName?: string;
  subjectNameEn?: string;
  chapterId?: string;
  chapterTitle?: string;
  chapterTitleEn?: string;
  plannedMinutes: number;
  actualMinutes: number;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed";
}

export interface MirrorDeletion {
  entityType: "study_session" | "task";
  id: string;
  deletedAt: string;
}

export interface LearningMirrorSync {
  sessions: MirroredStudySession[];
  tasks: MirroredTask[];
  deletions: MirrorDeletion[];
}

type Fields = Record<string, unknown>;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isoPattern = /^\d{4}-\d{2}-\d{2}T/;
const record = (value: unknown): value is Fields => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max: number) => typeof value === "string" && value.length > 0 && value.length <= max;
const optionalText = (value: unknown, max: number) => value === undefined || text(value, max);
const integer = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
const optionalInteger = (value: unknown, min: number, max: number) => value === undefined || integer(value, min, max);
const date = (value: unknown) => {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const iso = (value: unknown) => typeof value === "string" && value.length <= 40 && isoPattern.test(value) && !Number.isNaN(Date.parse(value));

function session(value: unknown): value is MirroredStudySession {
  if (!record(value)) return false;
  return text(value.id, 160) && iso(value.updatedAt) && date(value.localDate) &&
    optionalText(value.subjectId, 160) && optionalText(value.subjectName, 200) && optionalText(value.subjectNameEn, 200) &&
    optionalText(value.chapterId, 160) && optionalText(value.chapterTitle, 300) && optionalText(value.chapterTitleEn, 300) &&
    iso(value.startedAt) && iso(value.endedAt) && integer(value.durationMinutes, 0, 1440) &&
    ["learning", "review", "practice", "recitation", "reading"].includes(String(value.sessionType)) &&
    optionalInteger(value.itemCount, 0, 100000) && optionalInteger(value.incorrectCount, 0, 100000);
}

function task(value: unknown): value is MirroredTask {
  if (!record(value)) return false;
  return text(value.id, 160) && iso(value.updatedAt) && date(value.date) && text(value.title, 300) &&
    optionalText(value.subjectId, 160) && optionalText(value.subjectName, 200) && optionalText(value.subjectNameEn, 200) &&
    optionalText(value.chapterId, 160) && optionalText(value.chapterTitle, 300) && optionalText(value.chapterTitleEn, 300) &&
    integer(value.plannedMinutes, 0, 1440) && integer(value.actualMinutes, 0, 100000) &&
    ["low", "medium", "high"].includes(String(value.priority)) && ["todo", "in_progress", "completed"].includes(String(value.status));
}

function deletion(value: unknown): value is MirrorDeletion {
  return record(value) && ["study_session", "task"].includes(String(value.entityType)) && text(value.id, 160) && iso(value.deletedAt);
}

export function parseLearningMirrorSync(value: unknown): LearningMirrorSync | null {
  if (!record(value) || !Array.isArray(value.sessions) || !Array.isArray(value.tasks) || !Array.isArray(value.deletions)) return null;
  const count = value.sessions.length + value.tasks.length + value.deletions.length;
  if (count === 0 || count > 200 || !value.sessions.every(session) || !value.tasks.every(task) || !value.deletions.every(deletion)) return null;
  return value as unknown as LearningMirrorSync;
}
