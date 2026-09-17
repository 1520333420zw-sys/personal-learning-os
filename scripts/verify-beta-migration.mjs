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
const { createInitialBetaState, migrateBetaState } = load("src/data/browser/beta-store.ts", { "./learning-outline": outline });
const previous = createInitialBetaState();
previous.version = 1;
for (const key of ["units", "englishContent", "subjectiveQuestions", "currentAffairs", "pdfDocuments", "pdfNotes"]) delete previous[key];
previous.tasks.push({ id: "kept-task", ownerId: "local-owner", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", title: "Keep my task", description: "", date: "2026-01-01", plannedMinutes: 25, actualMinutes: 0, priority: "medium", status: "todo", sourceType: "manual" });
previous.knowledgePoints[0].personalNote = "Keep my note";
const migrated = migrateBetaState(previous);
assert.equal(migrated.version, 2);
assert.equal(migrated.tasks.find((item) => item.id === "kept-task")?.title, "Keep my task");
assert.equal(migrated.knowledgePoints[0].personalNote, "Keep my note");
assert.equal(migrated.units.length, 81);
assert.equal(migrated.pdfDocuments.length, 0);
assert.ok(migrated.knowledgePoints[0].unitId);
assert.throws(() => migrateBetaState({ version: 2, ownerId: "x" }));
console.log("Beta v1 → v2 migration: passed");
