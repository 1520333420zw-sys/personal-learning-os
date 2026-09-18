import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

function load(file) {
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  new Function("module", "exports", "require", code)(compiledModule, compiledModule.exports, () => { throw new Error("Unexpected runtime import"); });
  return compiledModule.exports;
}

const { parseLearningAction } = load("src/domain/ai/actions.ts");
const today = "2026-09-18";
const cases = [
  { type: "createStudySession", date: today, subjectId: "subject-psychology-312", chapterId: "psych-general", minutes: 30, sessionType: "learning" },
  { type: "recordCountedStudy", date: today, subjectId: "subject-english", activity: "vocabulary_recitation", count: 20 },
  { type: "createStudySession", date: today, subjectId: "subject-politics", minutes: 45, sessionType: "learning" },
  { type: "recordCountedStudy", date: today, subjectId: "subject-psychology-312", activity: "question_mistakes", count: 5 },
  { type: "createStudySession", date: today, minutes: 30, sessionType: "reading" },
  { type: "createTask", title: "复习普通心理学", date: "2026-09-19", subjectId: "subject-psychology-312", chapterId: "psych-general", minutes: 40 },
];
for (const action of cases) assert.deepEqual(parseLearningAction(action), action);
assert.equal(parseLearningAction({ ...cases[1], count: 0 }), null);
assert.equal(parseLearningAction({ ...cases[0], minutes: "30" }), null);
assert.equal(parseLearningAction({ type: "unsupported" }), null);

process.env.AI_API_URL = "https://example.test/v1/chat/completions";
process.env.AI_API_KEY = "test-only-key";
process.env.AI_MODEL = "test-model";
const { configuredAIProvider, AIProviderError } = load("src/data/providers/configured-ai.ts");
let sent;
globalThis.fetch = async (_url, options) => {
  sent = JSON.parse(options.body);
  return new Response(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(cases[0]) } }] }), { status: 200 });
};
assert.deepEqual(await configuredAIProvider().generateJson("Return JSON", "test"), cases[0]);
assert.equal(sent.messages[0].role, "system");
assert.equal(sent.response_format.type, "json_object");
assert.equal("temperature" in sent, false);

globalThis.fetch = async () => new Response(JSON.stringify({ error: { code: "unsupported_value", type: "invalid_request_error", param: "temperature" } }), { status: 400 });
await assert.rejects(configuredAIProvider().generateJson("Return JSON", "test"), (error) => error instanceof AIProviderError && error.kind === "http" && error.details.status === 400 && error.details.parameter === "temperature");
globalThis.fetch = async () => new Response("not JSON", { status: 200 });
await assert.rejects(configuredAIProvider().generateJson("Return JSON", "test"), (error) => error instanceof AIProviderError && error.kind === "response_json");
globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ finish_reason: "stop", message: { content: "not JSON" } }] }), { status: 200 });
await assert.rejects(configuredAIProvider().generateJson("Return JSON", "test"), (error) => error instanceof AIProviderError && error.kind === "model_json");
console.log("Six action schemas and Chat Completions provider error categories: passed (mocked transport only)");
