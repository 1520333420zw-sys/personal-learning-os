import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

function load(file, imports = {}) {
  const source = fs.readFileSync(file, "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const compiledModule = { exports: {} };
  new Function("module", "exports", "require", code)(compiledModule, compiledModule.exports, (name) => {
    if (name in imports) return imports[name];
    throw new Error(`Unexpected runtime import: ${name}`);
  });
  return compiledModule.exports;
}

const outline = load("src/data/browser/learning-outline.ts");
const core = load("src/data/content-packs/core.ts", { "@/data/browser/learning-outline": outline });
const universal = load("src/data/content-packs/universal.ts");
const english = load("src/data/content-packs/english.ts");
const dates = { toLocalDateKey: (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` };
const store = load("src/data/browser/beta-store.ts", { "./learning-outline": outline, "@/data/content-packs/core": core, "@/data/content-packs/universal": universal, "@/data/content-packs/english": english, "@/lib/date": dates });
const review = load("src/domain/review/review-engine.ts");
const curriculum = load("src/domain/learning/curriculum.ts");
const experience = load("src/domain/learning/learning-experience.ts", { "@/domain/review/review-engine": review });
const weak = load("src/domain/analytics/weak-points.ts");
const planning = load("src/domain/planning/smart-plan.ts", { "@/domain/analytics/weak-points": weak, "@/domain/learning/curriculum": curriculum, "@/domain/learning/learning-experience": experience });
const speech = load("src/features/learning-experience/speech.ts");

const state = store.createInitialBetaState();
const catalog = curriculum.buildCurriculumCatalog(state);
assert.ok(catalog.curricula.some((item) => item.id === "curriculum-psychology"));
assert.ok(catalog.curricula.some((item) => item.id === "curriculum-politics"));
assert.ok(catalog.curricula.some((item) => item.id === "curriculum-english"));
for (const course of catalog.curricula) {
  const chapters = catalog.chapters.filter((item) => item.curriculumId === course.id);
  assert.deepEqual(chapters.map((item) => item.order), [...chapters].sort((a,b)=>a.order-b.order).map((item)=>item.order), `${course.id} chapters must be ordered`);
  for (const chapter of chapters) {
    const sections = catalog.sections.filter((item) => item.chapterId === chapter.id);
    assert.ok(sections.length > 0, `${chapter.id} must have sections`);
    assert.deepEqual(sections.map((item) => item.order), [...sections].sort((a,b)=>a.order-b.order).map((item)=>item.order), `${chapter.id} sections must be ordered`);
    for (const section of sections) for (const id of section.knowledgePointIds) assert.ok(state.knowledgePoints.some((item) => item.id === id), `${section.id} references missing ${id}`);
  }
}
for (const point of state.knowledgePoints) assert.ok(catalog.sections.some((item) => item.knowledgePointIds.includes(point.id)), `${point.id} is not mapped into a curriculum section`);
const first = catalog.sections.find((item) => item.knowledgePointIds.length > 0); assert.ok(first);
const lesson = curriculum.buildTeachingUnit(state, first); assert.ok(lesson);
for (const key of ["hook","simpleExplanation","formalDefinition","summary"]) assert.ok(lesson[key].trim(), `TeachingUnit ${key} is required`);
assert.ok(lesson.examples.length && lesson.feynmanPrompts.length);

const weakFeedback = experience.evaluateFeynman("这是一个很短的复述。", lesson);
assert.equal(weakFeedback.complete, false);
const fullFeedback = experience.evaluateFeynman(`${lesson.requiredTerms.join("，")}。我会说明成立条件，并用一个学习情境解释这个概念和结果。`, lesson);
assert.equal(fullFeedback.complete, true);
const now = new Date("2026-10-03T08:00:00.000Z");
state.feynmanAttempts.push({ id:"feynman-test",ownerId:state.ownerId,createdAt:now.toISOString(),updatedAt:now.toISOString(),sectionId:first.id,knowledgePointIds:first.knowledgePointIds,response:"我的解释",selfRating:"hard",feedback:"需要补充",retryCount:0,matchedTerms:[],missingTerms:lesson.requiredTerms });
const restored = store.migrateBetaState(JSON.parse(store.serializeBetaState(state)));
assert.equal(restored.feynmanAttempts.find((item) => item.id === "feynman-test")?.response, "我的解释", "Feynman attempt must persist through migration");

const question = state.questions.find((item) => first.knowledgePointIds.includes(item.knowledgePointId)); assert.ok(question);
let sequence = 0; const idFactory = (prefix) => `${prefix}-test-${++sequence}`;
assert.equal(experience.recordQuickCheckAttempt(state, question.id, ["definitely-wrong"], now, idFactory), false);
assert.ok(state.wrongQuestions.some((item) => item.questionId === question.id), "wrong quick check must create Weak Point evidence");
state.sectionProgress.push({id:`section-progress-${first.id}`,ownerId:state.ownerId,createdAt:now.toISOString(),updatedAt:now.toISOString(),curriculumId:catalog.chapters.find((item)=>item.id===first.chapterId).curriculumId,chapterId:first.chapterId,sectionId:first.id,status:"learning",lessonViewed:true,feynmanStatus:"completed",quickCheckCompleted:false,quickCheckCorrect:0,quickCheckTotal:0,startedAt:now.toISOString(),lastStudiedAt:now.toISOString()});
const siblingIds = catalog.sections.filter((item)=>item.chapterId===first.chapterId).map((item)=>item.id);
experience.completeCurriculumSection(state,{curriculumId:catalog.chapters.find((item)=>item.id===first.chapterId).curriculumId,chapterId:first.chapterId,sectionId:first.id,chapterSectionIds:siblingIds,correct:1,total:2},now);
assert.equal(state.sectionProgress.find((item)=>item.sectionId===first.id).status,"completed");
const continued = experience.resolveContinueLearning(state,catalog); assert.ok(continued); assert.notEqual(continued.section.id, first.id, "Continue Learning should advance after completion");

const gb={lang:"en-GB",name:"British"},us={lang:"en-US",name:"American"},generic={lang:"en-AU",name:"English"};
assert.equal(speech.selectEnglishVoice([generic,us,gb],"GB"),gb); assert.equal(speech.selectEnglishVoice([generic],"US"),generic,"speech must fall back to any English voice");
const reviewItem={reviewCount:0,ease:2.3,difficulty:5,intervalDays:0};
assert.equal(review.scheduleReview(reviewItem,"again",now).intervalDays,1);assert.ok(review.scheduleReview(reviewItem,"easy",now).intervalDays>1,"vocabulary Easy must schedule later than Again");
const plan=planning.buildSmartPlan(store.createInitialBetaState(),"2026-10-03");assert.ok(plan.suggestions.some((item)=>item.source==="curriculum"&&item.sectionId),"planning must recommend a concrete curriculum section");
console.log(`Learning Experience V3: ${catalog.curricula.length} curricula, ${catalog.chapters.length} chapters, ${catalog.sections.length} ordered sections; mapping, Feynman, Quick Check, progress, continue, speech fallback, review and planning checks passed`);
