import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import ts from "typescript";

function load(file, imports = {}) {
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiled = { exports: {} };
  new Function("module", "exports", "require", code)(compiled, compiled.exports, (name) => {
    if (name in imports) return imports[name];
    throw new Error(`Unexpected import ${name}`);
  });
  return compiled.exports;
}

const core = load("src/data/content-packs/core.ts");
const universal = load("src/data/content-packs/universal.ts");
const universalContent = universal.createUniversalContent();
const corePoints = core.createCoreKnowledgePoints();
const points = [...corePoints, ...universalContent.points];
const questions = [...core.createCoreQuestions(), ...universalContent.questions];
const chapters = new Set([
  "psych-general", "psych-social", "psych-development", "psych-education", "psych-experimental", "psych-statistics", "psych-measurement",
  "politics-marxism", "politics-theory", "politics-xi", "politics-history", "politics-ethics", "politics-current",
  ...universalContent.chapters.map((item) => item.id),
]);
const subjects = new Set(["subject-psychology-312", "subject-politics", ...universalContent.subjects.map((item) => item.id)]);
const pointIds = new Set(points.map((item) => item.id));
const allIds = [...points, ...questions].map((item) => item.id);
assert.equal(new Set(allIds).size, allIds.length, "duplicate content ID");

const normalizedConcepts = new Set();
for (const point of points) {
  assert.ok(point.title.trim(), `empty title ${point.id}`);
  assert.ok(point.coreConcept.trim(), `empty core content ${point.id}`);
  assert.ok(subjects.has(point.subjectId), `invalid subject ${point.id}`);
  assert.ok(chapters.has(point.chapterId), `missing chapter ${point.id}`);
  for (const id of point.prerequisiteIds ?? []) assert.ok(pointIds.has(id), `missing prerequisite ${point.id} -> ${id}`);
  for (const id of point.relatedPointIds ?? []) assert.ok(pointIds.has(id), `missing related point ${point.id} -> ${id}`);
  const normalized = point.coreConcept.replace(/\s+/g, "").toLowerCase();
  assert.ok(!normalizedConcepts.has(normalized), `duplicate core content ${point.id}`);
  normalizedConcepts.add(normalized);
}
for (const question of questions) {
  assert.ok(subjects.has(question.subjectId), `invalid question subject ${question.id}`);
  assert.ok(!question.chapterId || chapters.has(question.chapterId), `missing question chapter ${question.id}`);
  assert.ok(question.knowledgePointId && pointIds.has(question.knowledgePointId), `missing point ${question.id}`);
  assert.ok(question.stem.trim(), `empty stem ${question.id}`);
  assert.ok(question.explanation.trim(), `missing explanation ${question.id}`);
  assert.ok(question.options.length >= 2, `invalid options ${question.id}`);
  assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length, `duplicate option ${question.id}`);
  assert.ok(question.options.every((option) => option.id && option.text.trim()), `invalid option ${question.id}`);
  assert.ok(question.answer.length > 0, `missing answer ${question.id}`);
  for (const answer of question.answer) assert.ok(question.options.some((option) => option.id === answer), `invalid answer ${question.id}`);
  assert.equal(question.sourceType, "system");
  assert.equal(question.isOfficial, false);
  assert.ok(!question.source.includes("真题"));
}

const vocabulary = JSON.parse(fs.readFileSync("public/content/english/vocabulary-v1.json", "utf8"));
assert.equal(vocabulary.itemCount, vocabulary.items.length, "vocabulary manifest count mismatch");
assert.equal(vocabulary.items.length, 1000, "vocabulary pack must contain 1000 entries");
assert.equal(new Set(vocabulary.items.map((item) => item.id)).size, vocabulary.items.length, "duplicate vocabulary ID");
assert.equal(new Set(vocabulary.items.map((item) => item.word)).size, vocabulary.items.length, "duplicate vocabulary word");
for (const item of vocabulary.items) {
  assert.ok(item.id && item.word && item.meanings.length > 0, `invalid vocabulary entry ${item.id}`);
  assert.equal(item.sourceCategory, "ECDICT:ky");
  assert.ok(["high", "medium", "low"].includes(item.frequencyTier), `invalid tier ${item.id}`);
}
const digest = crypto.createHash("sha256").update(JSON.stringify(vocabulary.items)).digest("hex");
assert.equal(vocabulary.checksum, `sha256:${digest}`, "vocabulary checksum mismatch");

const stats = points.reduce((result, item) => ({ ...result, [item.subjectId]: (result[item.subjectId] ?? 0) + 1 }), {});
console.log(JSON.stringify({ points: points.length, questions: questions.length, vocabulary: vocabulary.items.length, bySubject: stats }, null, 2));
console.log("Content integrity: IDs, references, answers, explanations, source labels, pack count and checksum passed");
