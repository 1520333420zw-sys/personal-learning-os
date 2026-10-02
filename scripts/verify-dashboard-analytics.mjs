import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const source = fs.readFileSync("src/features/beta/dashboard-analytics.ts", "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const compiledModule = { exports: {} };
new Function("module", "exports", "require", code)(compiledModule, compiledModule.exports, (name) => {
  if (name === "@/lib/date") return { addLocalDays: (value, amount) => { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return date.toISOString().slice(0, 10); } };
  throw new Error(`Unexpected import: ${name}`);
});
const { getDashboardAnalytics } = compiledModule.exports;

const entity = { ownerId: "local-owner", createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z" };
const state = {
  studySessions: [
    { ...entity, id: "s1", subjectId: "psych", startedAt: "2026-10-02T01:00:00Z", endedAt: "2026-10-02T01:30:00Z", durationMinutes: 30, completed: true },
    { ...entity, id: "s2", subjectId: "english", startedAt: "2026-10-01T01:00:00Z", endedAt: "2026-10-01T01:20:00Z", durationMinutes: 20, completed: true },
  ],
  tasks: [
    { id: "t1", date: "2026-10-02", status: "completed" }, { id: "t2", date: "2026-10-02", status: "todo" },
    { id: "t3", date: "2026-10-01", status: "completed" },
  ],
  recitations: [{ id: "r1", status: "today", nextReviewAt: "2026-10-02" }],
  reviewItems: [{ id: "v1", kind: "vocabulary", status: "due", dueDate: "2026-10-02" }, { id: "q1", kind: "question", status: "due", dueDate: "2026-10-01" }],
  wrongQuestions: [{ questionId: "question-1", mastered: false }],
  questions: [{ id: "question-1", subjectId: "psych" }], knowledgePoints: [],
};
const analytics = getDashboardAnalytics(state, "2026-10-02");
assert.equal(analytics.today.minutes, 30);
assert.equal(analytics.today.sessions, 1);
assert.equal(analytics.today.completedTasks, 1);
assert.equal(analytics.today.pendingTasks, 1);
assert.equal(analytics.today.reviews, 2);
assert.equal(analytics.today.wrongReviews, 1);
assert.equal(analytics.week.completionRate, 67);
assert.equal(analytics.month.minutes, 50);
assert.equal(analytics.month.studyDays, 2);
assert.equal(analytics.month.streak, 2);
assert.equal(analytics.month.mostStudiedSubjectId, "psych");
assert.equal(analytics.month.weakestSubjectId, "psych");
console.log("Dashboard today, seven-day, monthly, streak, task and weakness analytics: passed");
