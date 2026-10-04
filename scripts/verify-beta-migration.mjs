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
const core = load("src/data/content-packs/core.ts", { "@/data/browser/learning-outline": outline });
const universal = load("src/data/content-packs/universal.ts");
const english = load("src/data/content-packs/english.ts");
const psychologyBooks = load("src/data/content-packs/psychology-books.ts");
const dates = { toLocalDateKey: (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` };
const { BETA_STORAGE_KEY, createInitialBetaState, migrateBetaState, loadBetaState, saveBetaState, tryLoadBetaState } = load("src/data/browser/beta-store.ts", {
  "./learning-outline": outline, "@/data/content-packs/core": core, "@/data/content-packs/universal": universal, "@/lib/date": dates,
  "@/data/content-packs/english": english,
  "@/data/content-packs/psychology-books": psychologyBooks,
});
const previous = createInitialBetaState();
previous.version = 1;
for (const key of ["units", "englishContent", "subjectiveQuestions", "currentAffairs", "pdfDocuments", "pdfNotes"]) delete previous[key];
previous.tasks.push({ id: "kept-task", ownerId: "local-owner", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", title: "Keep my task", description: "", date: "2026-01-01", plannedMinutes: 25, actualMinutes: 0, priority: "medium", status: "todo", sourceType: "manual" });
previous.knowledgePoints[0].personalNote = "Keep my note";
previous.contentVocabularyState = { "en-vocab-system": { familiarity: "vague", favorite: true, reviewCount: 2, updatedAt: "2026-10-03T00:00:00.000Z" } };
previous.contentPackManifests = previous.contentPackManifests.map((item) => item.packId === "core-psychology" ? { ...item, version: "old" } : item);
const migrated = migrateBetaState(previous);
assert.equal(migrated.version, 6);
assert.deepEqual(migrated.courseProgress, []);
assert.deepEqual(migrated.chapterProgress, []);
assert.deepEqual(migrated.sectionProgress, []);
assert.deepEqual(migrated.feynmanAttempts, []);
assert.deepEqual(migrated.cloudSync, { deletions: [] });
assert.deepEqual(migrated.externalWriteReceipts, []);
assert.equal(migrated.vocabularyStudyPreferences.mode, "standard");
assert.deepEqual(migrated.vocabularyStudyPreferences.stages, ["en-zh", "zh-en", "audio", "blank"]);
assert.equal(migrated.tasks.find((item) => item.id === "kept-task")?.title, "Keep my task");
assert.equal(migrated.knowledgePoints[0].personalNote, "Keep my note");
assert.equal(migrated.contentVocabularyState["en-vocab-system"].familiarity, "vague");
assert.equal(migrated.units.length, 81);
assert.equal(migrated.pdfDocuments.length, 0);
const legacyLearning = createInitialBetaState();
legacyLearning.tasks.push({ id:"migration-task",ownerId:legacyLearning.ownerId,createdAt:"2026-10-03T00:00:00.000Z",updatedAt:"2026-10-03T00:00:00.000Z",title:"Keep task",description:"",date:"2026-10-04",plannedMinutes:25,actualMinutes:10,priority:"medium",status:"todo",sourceType:"manual" });
legacyLearning.studySessions.push({ id:"migration-session",ownerId:legacyLearning.ownerId,createdAt:"2026-10-03T00:00:00.000Z",updatedAt:"2026-10-03T00:30:00.000Z",subjectId:"subject-psychology-312",startedAt:"2026-10-03T00:00:00.000Z",endedAt:"2026-10-03T00:30:00.000Z",durationMinutes:30,sessionType:"learning",completed:true,notes:"Keep session" });
legacyLearning.reviewItems.push({ id:"migration-review",ownerId:legacyLearning.ownerId,createdAt:"2026-10-03T00:00:00.000Z",updatedAt:"2026-10-03T00:00:00.000Z",kind:"knowledge",targetId:"kp-sensation-threshold",dueDate:"2026-10-04",status:"due" });
legacyLearning.wrongQuestions.push({ id:"migration-mistake",ownerId:legacyLearning.ownerId,createdAt:"2026-10-03T00:00:00.000Z",updatedAt:"2026-10-03T00:00:00.000Z",questionId:"q-psych-1",mastered:false });
legacyLearning.notes.push({ id:"migration-note",ownerId:legacyLearning.ownerId,createdAt:"2026-10-03T00:00:00.000Z",updatedAt:"2026-10-03T00:00:00.000Z",title:"Keep note",content:"personal",tags:[],favorite:false });
legacyLearning.externalWriteReceipts.push({ inboxId:"migration-receipt",importedAt:"2026-10-03T00:00:00.000Z",entityType:"study_session",entityId:"migration-session",fingerprint:"migration-fingerprint" });
legacyLearning.courseProgress.push({ id:"course-progress-curriculum-psychology",ownerId:legacyLearning.ownerId,createdAt:"2026-10-03T00:00:00.000Z",updatedAt:"2026-10-03T00:00:00.000Z",curriculumId:"curriculum-psychology",lastChapterId:"curriculum-chapter-unit-psych-general-1",lastSectionId:"curriculum-section-kp-sensation-threshold",startedAt:"2026-10-03T00:00:00.000Z",lastStudiedAt:"2026-10-03T00:00:00.000Z" });
legacyLearning.sectionProgress.push({ id:"section-progress-curriculum-section-kp-sensation-threshold",ownerId:legacyLearning.ownerId,createdAt:"2026-10-03T00:00:00.000Z",updatedAt:"2026-10-03T00:00:00.000Z",curriculumId:"curriculum-psychology",chapterId:"curriculum-chapter-unit-psych-general-1",sectionId:"curriculum-section-kp-sensation-threshold",status:"completed",lessonViewed:true,feynmanStatus:"completed",quickCheckCompleted:true,quickCheckCorrect:2,quickCheckTotal:2,startedAt:"2026-10-03T00:00:00.000Z",completedAt:"2026-10-03T00:20:00.000Z",lastStudiedAt:"2026-10-03T00:20:00.000Z" });
legacyLearning.feynmanAttempts.push({ id:"feynman-legacy",ownerId:legacyLearning.ownerId,createdAt:"2026-10-03T00:00:00.000Z",updatedAt:"2026-10-03T00:00:00.000Z",sectionId:"curriculum-section-kp-sensation-threshold",knowledgePointIds:["kp-sensation-threshold"],response:"阈限复述",selfRating:"good",feedback:"ok",retryCount:0,matchedTerms:["感觉阈限"],missingTerms:[] });
let catalogBuilds = 0;
const originalBuildPsychologyBookCatalog = psychologyBooks.buildPsychologyBookCatalog;
psychologyBooks.buildPsychologyBookCatalog = (...args) => { catalogBuilds += 1; return originalBuildPsychologyBookCatalog(...args); };
const migratedLearning = migrateBetaState(JSON.parse(JSON.stringify(legacyLearning)));
psychologyBooks.buildPsychologyBookCatalog = originalBuildPsychologyBookCatalog;
assert.equal(catalogBuilds, 1, "Legacy learning records must share one textbook catalog build");
assert.equal(migratedLearning.courseProgress[0].curriculumId, "curriculum-psych-general-6");
assert.ok(migratedLearning.sectionProgress[0].sectionId.startsWith("curriculum-psych-general-6-chapter-"));
assert.equal(migratedLearning.feynmanAttempts[0].sectionId, migratedLearning.sectionProgress[0].sectionId);
for (const [collection, id] of [["tasks","migration-task"],["studySessions","migration-session"],["reviewItems","migration-review"],["wrongQuestions","migration-mistake"],["notes","migration-note"]]) {
  assert.ok(migratedLearning[collection].some((item) => item.id === id), `${collection} personal record was lost`);
}
assert.ok(migratedLearning.externalWriteReceipts.some((item) => item.inboxId === "migration-receipt"), "GPT receipt ledger entry was lost");
assert.equal(migratedLearning.reviewItems.find((item)=>item.id==="migration-review")?.targetId,"kp-sensation-threshold","Existing review identity must survive the schedule upgrade");
assert.ok(migrated.knowledgePoints[0].unitId);
assert.equal(migrated.subjects.filter((item) => item.id.startsWith("subject-universal-")).length, 13);
assert.ok(migrated.knowledgePoints.some((point) => point.id === "system-psych-statistics-p-value"));
assert.ok(migrated.questions.some((question) => question.id === "question-universal-mathematics-intro"));
assert.notEqual(migrated.contentPackManifests.find((item) => item.packId === "core-psychology")?.version, "old");
const stored = new Map();
globalThis.window = { localStorage: { getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) } };
stored.set(BETA_STORAGE_KEY, "{invalid-json");
assert.equal(tryLoadBetaState().ok, false, "Invalid persisted data must surface a recoverable load error");
assert.equal(stored.get(BETA_STORAGE_KEY), "{invalid-json", "A failed load must not overwrite the original browser data");
stored.delete(BETA_STORAGE_KEY);
const packaged = migrated.knowledgePoints.find((point) => point.id === "system-psych-statistics-p-value");
packaged.personalNote = "My own explanation"; packaged.mastery = "reviewing";
const packagedRecitation = migrated.recitations.find((item) => item.knowledgePointId === packaged.id);
packagedRecitation.status = "review"; packagedRecitation.reviewCount = 2;
saveBetaState(migrated);
assert.ok(!stored.get(BETA_STORAGE_KEY).includes("p 值是在零假设"), "Packaged text should not be stored with personal data");
const restored = loadBetaState();
assert.equal(restored.knowledgePoints.find((point) => point.id === packaged.id)?.personalNote, "My own explanation");
assert.equal(restored.knowledgePoints.find((point) => point.id === packaged.id)?.mastery, "reviewing");
assert.equal(restored.recitations.find((item) => item.id === packagedRecitation.id)?.reviewCount, 2);
const { deriveSystemExamPoints } = load("src/domain/learning/exam-point.ts");
const { applyConfirmedPlanChanges, parsePlanChanges } = load("src/domain/planning/ai-plan.ts");
const coreChapters = restored.chapters.filter((chapter) => chapter.subjectId === "subject-psychology-312" || chapter.subjectId === "subject-politics");
for (const chapter of coreChapters) {
  assert.ok(restored.knowledgePoints.some((point) => point.chapterId === chapter.id), `${chapter.id} has no content`);
  assert.ok(restored.questions.some((question) => question.chapterId === chapter.id), `${chapter.id} has no practice`);
  assert.ok(deriveSystemExamPoints(restored.knowledgePoints.filter((point) => point.chapterId === chapter.id), restored.questions, restored.reviewItems).length > 0);
}
const universalSubjects = restored.subjects.filter((subject) => subject.id.startsWith("subject-universal-"));
for (const subject of universalSubjects) {
  assert.equal(restored.knowledgePoints.filter((point) => point.subjectId === subject.id).length, 40);
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
const confirmed = parsePlanChanges({ changes: [{ kind: "add", title: "Confirmed task", subjectId: "subject-psychology-312", date: "2026-09-17", minutes: 20, reason: "Evidence-based suggestion" }] }, planContext);
assert.equal(planContext.tasks.length, 1, "Preview validation must not write tasks");
const applied = applyConfirmedPlanChanges(planContext.tasks, confirmed, "local-owner", () => "confirmed-task", new Date("2026-09-17T00:00:00.000Z"));
assert.equal(applied.length, 2);
assert.equal(applied[1].id, "confirmed-task");
assert.equal(applied[1].sourceType, "ai");
assert.equal(planContext.tasks.length, 1, "Confirmed application must not mutate the preview context");
assert.throws(() => migrateBetaState({ version: 2, ownerId: "x" }));
console.log("Beta v1 → v6 migration, content packs, learning progress overlays, system exam points and AI plan guardrails: passed");
for (const subjectId of ["subject-psychology-312", "subject-politics"]) {
  console.log(`${subjectId}: ${restored.chapters.filter((chapter) => chapter.subjectId === subjectId).length} modules, ${restored.units.filter((unit) => unit.subjectId === subjectId).length} outline units, ${restored.knowledgePoints.filter((point) => point.subjectId === subjectId).length} learning points`);
}
console.log(`Universal: ${universalSubjects.length} subjects, ${restored.knowledgePoints.filter((point) => point.subjectId.startsWith("subject-universal-")).length} learning points`);
console.log(`Auto recitations: ${restored.recitations.length}; system questions: ${restored.questions.filter((item) => item.examType === "system-practice").length}; written prompts: ${restored.subjectiveQuestions.length}`);
