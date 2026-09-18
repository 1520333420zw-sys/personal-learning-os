import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

function load(file, imports = {}) {
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  const localRequire = (name) => {
    if (name in imports) return imports[name];
    throw new Error(`Unexpected runtime import: ${name}`);
  };
  new Function("module", "exports", "require", code)(compiledModule, compiledModule.exports, localRequire);
  return compiledModule.exports;
}

const outline = load("src/data/browser/learning-outline.ts");
const core = load("src/data/content-packs/core.ts");
const universal = load("src/data/content-packs/universal.ts");
const dates = { toLocalDateKey: (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` };
const { BETA_STORAGE_KEY, createInitialBetaState, migrateBetaState, loadBetaState, saveBetaState } = load("src/data/browser/beta-store.ts", {
  "./learning-outline": outline, "@/data/content-packs/core": core, "@/data/content-packs/universal": universal, "@/lib/date": dates,
});
const previous = createInitialBetaState();
previous.version = 1;
for (const key of ["units", "englishContent", "subjectiveQuestions", "currentAffairs", "pdfDocuments", "pdfNotes"]) delete previous[key];
previous.tasks.push({ id: "kept-task", ownerId: "local-owner", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", title: "Keep my task", description: "", date: "2026-01-01", plannedMinutes: 25, actualMinutes: 0, priority: "medium", status: "todo", sourceType: "manual" });
previous.knowledgePoints[0].personalNote = "Keep my note";
const migrated = migrateBetaState(previous);
assert.equal(migrated.version, 4);
assert.deepEqual(migrated.externalWriteReceipts, []);
assert.equal(migrated.tasks.find((item) => item.id === "kept-task")?.title, "Keep my task");
assert.equal(migrated.knowledgePoints[0].personalNote, "Keep my note");
assert.equal(migrated.units.length, 81);
assert.equal(migrated.pdfDocuments.length, 0);
assert.ok(migrated.knowledgePoints[0].unitId);
assert.equal(migrated.subjects.filter((item) => item.id.startsWith("subject-universal-")).length, 13);
assert.ok(migrated.knowledgePoints.some((point) => point.id === "system-psych-statistics-p-value"));
assert.ok(migrated.questions.some((question) => question.id === "question-universal-mathematics-intro"));
const stored = new Map();
globalThis.window = { localStorage: { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) } };
const packaged = migrated.knowledgePoints.find((point) => point.id === "system-psych-statistics-p-value");
packaged.personalNote = "My own explanation"; packaged.mastery = "reviewing";
saveBetaState(migrated);
assert.ok(!stored.get(BETA_STORAGE_KEY).includes("p 值是在零假设"), "Packaged text should not be stored with personal data");
const restored = loadBetaState();
assert.equal(restored.knowledgePoints.find((point) => point.id === packaged.id)?.personalNote, "My own explanation");
assert.equal(restored.knowledgePoints.find((point) => point.id === packaged.id)?.mastery, "reviewing");
const { deriveSystemExamPoints } = load("src/domain/learning/exam-point.ts");
const { parsePlanChanges } = load("src/domain/planning/ai-plan.ts");
const coreChapters = restored.chapters.filter((chapter) => chapter.subjectId === "subject-psychology-312" || chapter.subjectId === "subject-politics");
for (const chapter of coreChapters) {
  assert.ok(restored.knowledgePoints.some((point) => point.chapterId === chapter.id), `${chapter.id} has no content`);
  assert.ok(restored.questions.some((question) => question.chapterId === chapter.id), `${chapter.id} has no practice`);
  assert.ok(deriveSystemExamPoints(restored.knowledgePoints.filter((point) => point.chapterId === chapter.id), restored.questions, restored.reviewItems).length > 0);
}
const universalSubjects = restored.subjects.filter((subject) => subject.id.startsWith("subject-universal-"));
for (const subject of universalSubjects) {
  assert.equal(restored.knowledgePoints.filter((point) => point.subjectId === subject.id).length, 4);
  assert.ok(restored.questions.some((question) => question.subjectId === subject.id));
}
const planContext = { today: "2026-09-17", subjectIds: ["subject-psychology-312"],
  tasks: [{ id: "locked", title: "Keep", subjectId: "subject-psychology-312", date: "2026-09-17", plannedMinutes: 30, actualMinutes: 0, status: "todo", planningControl: "locked" }],
  profile: { goal: "", dailyMinutes: 60, weeklyGoalMinutes: 300, subjectPriorities: {}, weakSubjectIds: [], workHours: "", sleepHours: "", restPreferences: "", days: [], updatedAt: "" },
  recentStudy: [], dueReviews: [], mastery: [] };
assert.equal(parsePlanChanges({ changes: [{ kind: "move", taskId: "locked", date: "2026-09-18", reason: "Test" }] }, planContext), null);
assert.equal(parsePlanChanges({ changes: [{ kind: "add", title: "Valid task", subjectId: "subject-psychology-312", date: "2026-09-17", minutes: 40, reason: "Test" }] }, planContext), null);
assert.equal(parsePlanChanges({ changes: [{ kind: "add", title: "Valid task", subjectId: "subject-psychology-312", date: "2026-09-17", minutes: 20, reason: "Test" }] }, planContext)?.length, 1);
assert.equal(parsePlanChanges({ changes: [{ kind: "add", title: "Invalid date", subjectId: "subject-psychology-312", date: "2026-09-99", minutes: 20, reason: "Test" }] }, planContext), null);
const adjustableContext = { ...planContext, tasks: [{ ...planContext.tasks[0], planningControl: "adjustable" }] };
assert.equal(parsePlanChanges({ changes: [
  { kind: "move", taskId: "locked", date: "2026-09-18", reason: "One" },
  { kind: "move", taskId: "locked", date: "2026-09-19", reason: "Two" },
] }, adjustableContext), null);
assert.throws(() => migrateBetaState({ version: 2, ownerId: "x" }));
console.log("Beta v1 → v4 migration, content packs, system exam points and AI plan guardrails: passed");
for (const subjectId of ["subject-psychology-312", "subject-politics"]) {
  console.log(`${subjectId}: ${restored.chapters.filter((chapter) => chapter.subjectId === subjectId).length} modules, ${restored.units.filter((unit) => unit.subjectId === subjectId).length} outline units, ${restored.knowledgePoints.filter((point) => point.subjectId === subjectId).length} learning points`);
}
console.log(`Universal: ${universalSubjects.length} subjects, ${restored.knowledgePoints.filter((point) => point.subjectId.startsWith("subject-universal-")).length} learning points`);
console.log(`Auto recitations: ${restored.recitations.length}; system questions: ${restored.questions.filter((item) => item.examType === "system-practice").length}; written prompts: ${restored.subjectiveQuestions.length}`);
