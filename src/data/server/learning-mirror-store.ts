import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { LearningMirrorSync, MirroredStudySession, MirroredTask } from "@/domain/learning-mirror";

interface Statement {
  bind(...values: (string | number | null)[]): Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
export interface LearningMirrorDatabase { prepare(query: string): Statement; }
export interface LearningMirrorEnvironment {
  EXTERNAL_INBOX_DB?: LearningMirrorDatabase;
  EXTERNAL_READ_TOKEN?: string;
  EXTERNAL_SYNC_TOKEN?: string;
  EXTERNAL_WRITE_TOKEN?: string;
}

export async function learningMirrorEnvironment(): Promise<LearningMirrorEnvironment> {
  try { return (await getCloudflareContext({ async: true })).env as LearningMirrorEnvironment; }
  catch { return {}; }
}

export function mirrorConfigured(env: LearningMirrorEnvironment): boolean {
  return Boolean(env.EXTERNAL_INBOX_DB);
}

export function learningReadConfigured(env: LearningMirrorEnvironment): boolean {
  return Boolean(env.EXTERNAL_INBOX_DB && env.EXTERNAL_READ_TOKEN && env.EXTERNAL_READ_TOKEN.length >= 32 &&
    env.EXTERNAL_READ_TOKEN !== env.EXTERNAL_SYNC_TOKEN && env.EXTERNAL_READ_TOKEN !== env.EXTERNAL_WRITE_TOKEN);
}

async function tombstone(db: LearningMirrorDatabase, ownerId: string, type: string, id: string) {
  return db.prepare("SELECT deleted_at FROM learning_mirror_tombstone WHERE owner_id = ? AND entity_type = ? AND entity_id = ?")
    .bind(ownerId, type, id).first<{ deleted_at: string }>();
}

async function upsertSession(db: LearningMirrorDatabase, ownerId: string, item: MirroredStudySession, now: string) {
  const deleted = await tombstone(db, ownerId, "study_session", item.id);
  if (deleted && deleted.deleted_at >= item.updatedAt) return;
  if (deleted) await db.prepare("DELETE FROM learning_mirror_tombstone WHERE owner_id = ? AND entity_type = 'study_session' AND entity_id = ?")
    .bind(ownerId, item.id).run();
  await db.prepare(`INSERT INTO study_session_mirror
    (owner_id, id, subject_id, subject_name, subject_name_en, chapter_id, chapter_title, chapter_title_en, local_date, started_at, ended_at, duration_minutes, session_type, item_count, incorrect_count, updated_at, mirrored_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(owner_id, id) DO UPDATE SET
      subject_id=excluded.subject_id, subject_name=excluded.subject_name, subject_name_en=excluded.subject_name_en,
      chapter_id=excluded.chapter_id, chapter_title=excluded.chapter_title, chapter_title_en=excluded.chapter_title_en,
      local_date=excluded.local_date, started_at=excluded.started_at, ended_at=excluded.ended_at,
      duration_minutes=excluded.duration_minutes, session_type=excluded.session_type, item_count=excluded.item_count,
      incorrect_count=excluded.incorrect_count, updated_at=excluded.updated_at, mirrored_at=excluded.mirrored_at
    WHERE excluded.updated_at >= study_session_mirror.updated_at`)
    .bind(ownerId, item.id, item.subjectId ?? null, item.subjectName ?? null, item.subjectNameEn ?? null,
      item.chapterId ?? null, item.chapterTitle ?? null, item.chapterTitleEn ?? null, item.localDate,
      item.startedAt, item.endedAt, item.durationMinutes, item.sessionType, item.itemCount ?? null,
      item.incorrectCount ?? null, item.updatedAt, now).run();
}

async function upsertTask(db: LearningMirrorDatabase, ownerId: string, item: MirroredTask, now: string) {
  const deleted = await tombstone(db, ownerId, "task", item.id);
  if (deleted && deleted.deleted_at >= item.updatedAt) return;
  if (deleted) await db.prepare("DELETE FROM learning_mirror_tombstone WHERE owner_id = ? AND entity_type = 'task' AND entity_id = ?")
    .bind(ownerId, item.id).run();
  await db.prepare(`INSERT INTO learning_task_mirror
    (owner_id, id, subject_id, subject_name, subject_name_en, chapter_id, chapter_title, chapter_title_en, task_date, title, planned_minutes, actual_minutes, priority, status, updated_at, mirrored_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(owner_id, id) DO UPDATE SET
      subject_id=excluded.subject_id, subject_name=excluded.subject_name, subject_name_en=excluded.subject_name_en,
      chapter_id=excluded.chapter_id, chapter_title=excluded.chapter_title, chapter_title_en=excluded.chapter_title_en,
      task_date=excluded.task_date, title=excluded.title, planned_minutes=excluded.planned_minutes,
      actual_minutes=excluded.actual_minutes, priority=excluded.priority, status=excluded.status,
      updated_at=excluded.updated_at, mirrored_at=excluded.mirrored_at
    WHERE excluded.updated_at >= learning_task_mirror.updated_at`)
    .bind(ownerId, item.id, item.subjectId ?? null, item.subjectName ?? null, item.subjectNameEn ?? null,
      item.chapterId ?? null, item.chapterTitle ?? null, item.chapterTitleEn ?? null, item.date, item.title,
      item.plannedMinutes, item.actualMinutes, item.priority, item.status, item.updatedAt, now).run();
}

export async function applyLearningMirrorSync(db: LearningMirrorDatabase, ownerId: string, payload: LearningMirrorSync) {
  const now = new Date().toISOString();
  for (const item of payload.sessions) await upsertSession(db, ownerId, item, now);
  for (const item of payload.tasks) await upsertTask(db, ownerId, item, now);
  for (const item of payload.deletions) {
    await db.prepare(`INSERT INTO learning_mirror_tombstone (owner_id, entity_type, entity_id, deleted_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(owner_id, entity_type, entity_id) DO UPDATE SET deleted_at=excluded.deleted_at
      WHERE excluded.deleted_at > learning_mirror_tombstone.deleted_at`)
      .bind(ownerId, item.entityType, item.id, item.deletedAt).run();
    const table = item.entityType === "study_session" ? "study_session_mirror" : "learning_task_mirror";
    await db.prepare(`DELETE FROM ${table} WHERE owner_id = ? AND id = ? AND updated_at <= ?`)
      .bind(ownerId, item.id, item.deletedAt).run();
  }
  return { sessions: payload.sessions.length, tasks: payload.tasks.length, deletions: payload.deletions.length, syncedAt: now };
}

interface SummaryRow { total_minutes: number | null; session_count: number; }
interface SubjectSummaryRow { subject_id: string | null; subject_name: string | null; subject_name_en: string | null; total_minutes: number; session_count: number; }

export async function getLearningSummary(db: LearningMirrorDatabase, ownerId: string, from: string, to: string, subjectId?: string) {
  const clause = subjectId ? " AND subject_id = ?" : "";
  const values = subjectId ? [ownerId, from, to, subjectId] : [ownerId, from, to];
  const total = await db.prepare(`SELECT COALESCE(SUM(duration_minutes), 0) AS total_minutes, COUNT(*) AS session_count FROM study_session_mirror WHERE owner_id = ? AND local_date >= ? AND local_date <= ?${clause}`)
    .bind(...values).first<SummaryRow>();
  const subjects = (await db.prepare(`SELECT subject_id, subject_name, subject_name_en, SUM(duration_minutes) AS total_minutes, COUNT(*) AS session_count FROM study_session_mirror WHERE owner_id = ? AND local_date >= ? AND local_date <= ?${clause} GROUP BY subject_id, subject_name, subject_name_en ORDER BY total_minutes DESC`)
    .bind(...values).all<SubjectSummaryRow>()).results;
  return { from, to, totalMinutes: total?.total_minutes ?? 0, sessionCount: total?.session_count ?? 0,
    subjects: subjects.map((row) => ({ subjectId: row.subject_id, subjectName: row.subject_name, subjectNameEn: row.subject_name_en, totalMinutes: row.total_minutes, sessionCount: row.session_count })) };
}

interface SessionRow {
  id: string; subject_id: string | null; subject_name: string | null; subject_name_en: string | null;
  chapter_id: string | null; chapter_title: string | null; chapter_title_en: string | null; local_date: string;
  started_at: string; ended_at: string; duration_minutes: number; session_type: string; item_count: number | null; incorrect_count: number | null;
}

export async function listRecentMirroredSessions(db: LearningMirrorDatabase, ownerId: string, limit: number, subjectId?: string) {
  const clause = subjectId ? " AND subject_id = ?" : "";
  const values = subjectId ? [ownerId, subjectId, limit] : [ownerId, limit];
  const rows = (await db.prepare(`SELECT id, subject_id, subject_name, subject_name_en, chapter_id, chapter_title, chapter_title_en, local_date, started_at, ended_at, duration_minutes, session_type, item_count, incorrect_count FROM study_session_mirror WHERE owner_id = ?${clause} ORDER BY ended_at DESC LIMIT ?`)
    .bind(...values).all<SessionRow>()).results;
  return rows.map((row) => ({ id: row.id, date: row.local_date, subjectId: row.subject_id, subjectName: row.subject_name,
    subjectNameEn: row.subject_name_en, chapterId: row.chapter_id, chapterTitle: row.chapter_title,
    chapterTitleEn: row.chapter_title_en, startedAt: row.started_at, endedAt: row.ended_at,
    durationMinutes: row.duration_minutes, sessionType: row.session_type, itemCount: row.item_count, incorrectCount: row.incorrect_count }));
}

interface TaskRow {
  id: string; task_date: string; title: string; subject_id: string | null; subject_name: string | null; subject_name_en: string | null;
  chapter_id: string | null; chapter_title: string | null; chapter_title_en: string | null; planned_minutes: number;
  actual_minutes: number; priority: string; status: string;
}

export async function listMirroredTasks(db: LearningMirrorDatabase, ownerId: string, from: string, to: string, status?: string) {
  const clause = status ? " AND status = ?" : "";
  const values = status ? [ownerId, from, to, status] : [ownerId, from, to];
  const rows = (await db.prepare(`SELECT id, task_date, title, subject_id, subject_name, subject_name_en, chapter_id, chapter_title, chapter_title_en, planned_minutes, actual_minutes, priority, status FROM learning_task_mirror WHERE owner_id = ? AND task_date >= ? AND task_date <= ?${clause} ORDER BY task_date ASC, priority DESC`)
    .bind(...values).all<TaskRow>()).results;
  return rows.map((row) => ({ id: row.id, date: row.task_date, title: row.title, subjectId: row.subject_id,
    subjectName: row.subject_name, subjectNameEn: row.subject_name_en, chapterId: row.chapter_id,
    chapterTitle: row.chapter_title, chapterTitleEn: row.chapter_title_en, plannedMinutes: row.planned_minutes,
    actualMinutes: row.actual_minutes, priority: row.priority, status: row.status }));
}
