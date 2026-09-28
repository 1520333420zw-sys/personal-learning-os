import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

function load(file, imports = {}) {
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  new Function("module", "exports", "require", code)(compiledModule, compiledModule.exports, (name) => {
    if (name in imports) return imports[name];
    throw new Error(`Unexpected import: ${name}`);
  });
  return compiledModule.exports;
}

const domain = load("src/domain/learning-mirror.ts");
const browser = load("src/data/browser/learning-mirror-sync.ts", {
  "@/lib/date": { toLocalDateKey: (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` },
});
const server = load("src/data/server/learning-mirror-store.ts", {
  "@opennextjs/cloudflare": { getCloudflareContext: async () => ({ env: {} }) },
});

const subject = { id: "subject-psychology-312", name: "312 心理学", nameEn: "312 Psychology" };
const chapter = { id: "psych-general", subjectId: subject.id, title: "普通心理学", titleEn: "General Psychology" };
const session = { id: "session-1", ownerId: "local-owner", createdAt: "2026-09-28T00:00:00.000Z", updatedAt: "2026-09-28T01:00:00.000Z",
  subjectId: subject.id, chapterId: chapter.id, startedAt: "2026-09-28T00:30:00.000Z", endedAt: "2026-09-28T01:00:00.000Z",
  durationMinutes: 30, sessionType: "learning", completed: true };
const task = { id: "task-1", ownerId: "local-owner", createdAt: session.createdAt, updatedAt: session.updatedAt, title: "复习普通心理学", description: "",
  subjectId: subject.id, chapterId: chapter.id, date: "2026-09-29", plannedMinutes: 40, actualMinutes: 0, priority: "high", status: "todo", sourceType: "manual" };
const state = { subjects: [subject], chapters: [chapter], studySessions: [session], tasks: [task] };
const projection = browser.projectLearningMirror(state);
assert.equal(projection.sessions[0].subjectName, "312 心理学");
assert.equal(projection.sessions[0].chapterTitle, "普通心理学");
assert.equal(projection.tasks[0].title, "复习普通心理学");
const changes = browser.createLearningMirrorChanges(state, { sessions: {}, tasks: {} });
assert.equal(changes.sessions.length, 1);
assert.equal(changes.tasks.length, 1);
assert.ok(domain.parseLearningMirrorSync({ sessions: changes.sessions, tasks: changes.tasks, deletions: [] }));
assert.equal(domain.parseLearningMirrorSync({ sessions: [{ ...changes.sessions[0], durationMinutes: -1 }], tasks: [], deletions: [] }), null);
const deletionChanges = browser.createLearningMirrorChanges({ ...state, studySessions: [], tasks: [] }, changes.ledger);
assert.deepEqual(deletionChanges.deletions.map((item) => item.entityType).sort(), ["study_session", "task"]);

const statements = [];
const db = { prepare(sql) { const statement = { sql, args: [], bind(...args) { this.args = args; return this; }, async first() {
  if (sql.startsWith("SELECT deleted_at")) return null;
  if (sql.includes("COALESCE(SUM")) return { total_minutes: 30, session_count: 1 };
  return null;
}, async all() {
  if (sql.includes("GROUP BY")) return { results: [{ subject_id: subject.id, subject_name: subject.name, subject_name_en: subject.nameEn, total_minutes: 30, session_count: 1 }] };
  if (sql.includes("FROM study_session_mirror")) return { results: [] };
  if (sql.includes("FROM learning_task_mirror")) return { results: [] };
  return { results: [] };
}, async run() { statements.push({ sql, args: this.args }); } }; return statement; } };
await server.applyLearningMirrorSync(db, "local-owner", { sessions: changes.sessions, tasks: changes.tasks, deletions: deletionChanges.deletions });
assert.equal(statements.some((item) => item.sql.includes("INSERT INTO study_session_mirror")), true);
assert.equal(statements.some((item) => item.sql.includes("INSERT INTO learning_task_mirror")), true);
assert.equal(statements.filter((item) => item.sql.includes("learning_mirror_tombstone")).length >= 2, true);
const summary = await server.getLearningSummary(db, "local-owner", "2026-09-28", "2026-09-28");
assert.equal(summary.totalMinutes, 30);
assert.equal(summary.subjects[0].subjectName, "312 心理学");
assert.equal(server.learningReadConfigured({ EXTERNAL_INBOX_DB: db, EXTERNAL_READ_TOKEN: "r".repeat(32), EXTERNAL_SYNC_TOKEN: "s".repeat(32) }), true);
assert.equal(server.learningReadConfigured({ EXTERNAL_INBOX_DB: db, EXTERNAL_READ_TOKEN: "s".repeat(32), EXTERNAL_SYNC_TOKEN: "s".repeat(32) }), false);
assert.equal(server.learningReadConfigured({ EXTERNAL_INBOX_DB: db, EXTERNAL_READ_TOKEN: "w".repeat(32), EXTERNAL_WRITE_TOKEN: "w".repeat(32) }), false);

const migration = fs.readFileSync("migrations/0002_learning_read_mirror.sql", "utf8");
for (const table of ["study_session_mirror", "learning_task_mirror", "learning_mirror_tombstone"]) assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
console.log("Learning mirror projection, validation, deletion ledger, D1 upserts, read summary and token separation: passed");
