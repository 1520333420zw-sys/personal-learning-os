import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
function load(file,imports={}){const source=fs.readFileSync(file,"utf8");const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const compiled={exports:{}};new Function("module","exports","require",code)(compiled,compiled.exports,(name)=>{if(name in imports)return imports[name];throw new Error(`Unexpected import ${name}`);});return compiled.exports;}
const review=load("src/domain/review/review-engine.ts");
const weak=load("src/domain/analytics/weak-points.ts");
const curriculum=load("src/domain/learning/curriculum.ts");
const experience=load("src/domain/learning/learning-experience.ts",{"@/domain/review/review-engine":review});
const planning=load("src/domain/planning/smart-plan.ts",{"@/domain/analytics/weak-points":weak,"@/domain/learning/curriculum":curriculum,"@/domain/learning/learning-experience":experience});
const baseReview={intervalDays:0,ease:2.3,difficulty:5,reviewCount:0};
assert.equal(review.scheduleReview(baseReview,"again",new Date("2026-10-02T08:00:00Z")).intervalDays,1);
assert.equal(review.scheduleReview(baseReview,"hard",new Date("2026-10-02T08:00:00Z")).intervalDays,2);
assert.equal(review.scheduleReview(baseReview,"good",new Date("2026-10-02T08:00:00Z")).intervalDays,2);
assert.equal(review.scheduleReview(baseReview,"easy",new Date("2026-10-02T08:00:00Z")).intervalDays,4);
const point={id:"kp",subjectId:"subject",chapterId:"chapter",title:"Evidence point",mastery:"reviewing"};
const state={knowledgePoints:[point],questions:[{id:"q",knowledgePointId:"kp",subjectId:"subject"}],questionAttempts:[{questionId:"q",correct:false},{questionId:"q",correct:true}],wrongQuestions:[{questionId:"q",mastered:false}],reviewItems:[{id:"r",targetId:"kp",status:"due",dueDate:"2026-10-01",kind:"knowledge",title:"Review",subjectId:"subject",chapterId:"chapter"}],recitations:[],vocabulary:[],tasks:[],studySessions:[],subjects:[{id:"subject",slug:"subject",name:"Subject",nameEn:"Subject"}],chapters:[],units:[],englishContent:[],courseProgress:[],sectionProgress:[],feynmanAttempts:[],planningProfile:{dailyMinutes:60,subjectPriorities:{subject:3},days:[]}};
const analytics=weak.analyzeWeakPoints(state,"2026-10-02");assert.equal(analytics.weakKnowledgePoints[0].knowledgePointId,"kp");assert.ok(analytics.weakKnowledgePoints[0].evidenceCount>=4);assert.ok(analytics.weakKnowledgePoints[0].reason.length>=3);
const plan=planning.buildSmartPlan(state,"2026-10-02");assert.ok(plan.suggestions.some((item)=>item.source==="review"));assert.ok(plan.suggestions.some((item)=>item.source==="weak_point"));assert.ok(plan.totalMinutes<=60);
assert.equal(weak.analyzeWeakPoints({...state,questionAttempts:[],wrongQuestions:[],reviewItems:[],knowledgePoints:[{...point,mastery:"new"}]},"2026-10-02").weakKnowledgePoints.length,0);
console.log("Review scheduling, evidence-based weak analytics and grounded planning: passed");


