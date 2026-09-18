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

const parser = load("src/domain/external-writes/command.ts");
const merge = load("src/data/browser/external-write-merge.ts");
const repository = load("src/data/server/external-write-store.ts", { "@opennextjs/cloudflare": { getCloudflareContext: async () => ({ env: {} }) } });
const outline = load("src/data/browser/learning-outline.ts");
const core = load("src/data/content-packs/core.ts");
const universal = load("src/data/content-packs/universal.ts");
const store = load("src/data/browser/beta-store.ts", {
  "./learning-outline": outline, "@/data/content-packs/core": core, "@/data/content-packs/universal": universal,
  "@/lib/date": { toLocalDateKey: (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` },
});
let state = store.createInitialBetaState();
const previous = { ...state, version: 3 };
delete previous.externalWriteReceipts;
previous.tasks.push({ id: "old-task", ownerId: "local-owner", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", title: "Keep", description: "", date: "2026-01-01", plannedMinutes: 25, actualMinutes: 0, priority: "medium", status: "todo", sourceType: "manual" });
state = store.migrateBetaState(previous);
assert.equal(state.version, 4);
assert.deepEqual(state.externalWriteReceipts, []);

const cases = [
  { type: "study_session", date: "2026-09-18", durationMinutes: 30, subjectId: "subject-psychology-312", chapterId: "psych-general", sessionType: "learning" },
  { type: "task", title: "Review psychology", date: "2026-09-19", plannedMinutes: 40, priority: "medium", subjectId: "subject-psychology-312" },
  { type: "recitation", title: "Key definition", content: "Personal notes", subjectId: "subject-politics" },
  { type: "reading", title: "A saved article", url: "https://example.com/article", notes: "My notes" },
  { type: "wrong_question", questionId: "q-psych-1" },
];
for (const [index, input] of cases.entries()) {
  const command = parser.parseExternalWrite(input);
  assert.ok(command, `Case ${index} should parse`);
  const id = `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
  const receipt = { id, command, status: "pending", createdAt: "2026-09-18T00:00:00Z" };
  const created = merge.applyExternalWrite(state, receipt);
  assert.ok(created.length);
  assert.deepEqual(merge.applyExternalWrite(state, receipt), []);
}
assert.equal(state.tasks.length, 2);
assert.equal(state.studySessions.length, 1);
assert.equal(state.studySessions[0].subjectId, "subject-psychology-312");
assert.equal(state.recitations.filter((item) => item.id.startsWith("external-")).length, 1);
assert.equal(state.reading.length, 1);
assert.equal(state.wrongQuestions.length, 1);
assert.equal(state.reviewItems.filter((item) => item.kind === "question").length, 1);
const localStorage = new Map();
globalThis.window = { localStorage: { getItem: (key) => localStorage.get(key) ?? null, setItem: (key, value) => localStorage.set(key, value) } };
store.saveBetaState(state);
state = store.loadBetaState();
assert.equal(state.externalWriteReceipts.length, 5);
assert.equal(state.studySessions.length, 1);
assert.equal(state.tasks.find((item) => item.id === "old-task")?.title, "Keep");
assert.ok(merge.revertExternalWrite(state, state.externalWriteReceipts.at(-1).id));
assert.equal(state.studySessions.length, 0);
assert.equal(state.tasks.find((item) => item.id === "old-task")?.title, "Keep");
assert.equal(merge.revertExternalWrite(state, state.externalWriteReceipts.at(-1).id), false);

assert.equal(parser.parseExternalWrite({ ...cases[1], date: "2026-02-30" }), null);
assert.equal(parser.parseExternalWrite({ ...cases[1], plannedMinutes: 999 }), null);
assert.equal(parser.parseExternalWrite({ ...cases[3], url: "javascript:alert(1)" }), null);
assert.equal(parser.parseExternalWrite({ ...cases[2], unknown: true }), null);
assert.throws(() => merge.applyExternalWrite(state, { id: "other", command: { ...cases[4], questionId: "not-real" }, status: "pending", createdAt: "" }), /UNKNOWN_QUESTION/);

const rows = [];
const db = { prepare(sql) { return { bind(...args) { this.args = args; return this; }, async run() {
  if (sql.startsWith("INSERT")) { const [id, idempotency_key, content_hash, owner_id, command_json, created_at] = this.args;
    if (!rows.some((row) => row.owner_id === owner_id && row.idempotency_key === idempotency_key)) rows.push({ seq: rows.length + 1, id, idempotency_key, content_hash, owner_id, command_json, created_at, status: "pending" }); }
  if (sql.startsWith("UPDATE")) { const [status, , owner_id, id, oldStatus] = this.args; const row = rows.find((item) => item.owner_id === owner_id && item.id === id && item.status === oldStatus); if (row) row.status = status; }
}, async first() { if (sql.includes("idempotency_key = ?")) return rows.find((row) => row.owner_id === this.args[0] && row.idempotency_key === this.args[1]) ?? null;
  return rows.find((row) => row.owner_id === this.args[0] && row.id === this.args[1]) ?? null; },
async all() { return { results: rows.filter((row) => row.owner_id === this.args[0] && row.seq > this.args[1] && ["pending", "revoke_requested"].includes(row.status)).slice(0, 101) }; } }; } };
const first = await repository.createExternalWrite(db, "local-owner", "unique-operation-key-123", cases[0]);
const repeated = await repository.createExternalWrite(db, "local-owner", "unique-operation-key-123", cases[0]);
const reordered = await repository.createExternalWrite(db, "local-owner", "unique-operation-key-123", Object.fromEntries(Object.entries(cases[0]).reverse()));
const conflicting = await repository.createExternalWrite(db, "local-owner", "unique-operation-key-123", cases[1]);
assert.equal(first.duplicate, false);
assert.equal(repeated.duplicate, true);
assert.equal(first.receipt.id, repeated.receipt.id);
assert.equal(reordered.duplicate, true);
assert.equal(reordered.conflict, false);
assert.equal(conflicting.conflict, true);
assert.equal((await repository.listExternalWrites(db, "local-owner", 0)).items.length, 1);
assert.equal((await repository.changeExternalWriteStatus(db, "local-owner", first.receipt.id, "pending", "applied")).status, "applied");
assert.equal((await repository.listExternalWrites(db, "local-owner", 0)).items.length, 0);
assert.equal(await repository.authorized("Bearer same-secret-123456789012345678901234", "same-secret-123456789012345678901234"), true);
assert.equal(await repository.authorized("Bearer different-secret-1234567890123456789", "same-secret-123456789012345678901234"), false);
console.log("External write validation, v3 migration, five imports, local undo, server idempotency and auth: passed");
