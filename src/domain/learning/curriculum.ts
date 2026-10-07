import type { BetaId, BetaState } from "@/domain/beta";
import { buildPsychologyBookCatalog } from "@/data/content-packs/psychology-books";

export interface Curriculum {
  id: BetaId; subjectId: BetaId; title: string; titleEn: string;
  version: string; examType: string; description: string; descriptionEn: string;
  author?: string; edition?: string; status?: "verified" | "needs_pdf_calibration"; sourceNote?: string;
}
export interface CurriculumChapter {
  id: BetaId; curriculumId: BetaId; sourceChapterId: BetaId; sourceUnitId?: BetaId;
  title: string; titleEn: string; order: number; description: string; descriptionEn: string;
  chapterNumber?: number; sourceStatus?: "verified" | "needs_pdf_calibration";
}
export interface CurriculumSection {
  id: BetaId; chapterId: BetaId; title: string; titleEn: string; order: number;
  knowledgePointIds: BetaId[]; englishContentIds?: BetaId[]; estimatedMinutes: number;
  sectionNumber?: number; kind?: "textbook" | "chapter_review"; sourceStatus?: "verified" | "needs_pdf_calibration"; sourceNote?: string;
  teaching?: Omit<TeachingUnit, "sectionId" | "quickCheckQuestionIds" | "recitationIds">;
}
export interface TeachingUnit {
  sectionId: BetaId; hook: string; hookEn: string; learningObjectives: string[];
  simpleExplanation: string; formalDefinition: string; examples: string[];
  counterExamples: string[]; comparison: string[]; examTips: string[];
  commonMistakes: string[]; summary: string; feynmanPrompts: string[];
  requiredTerms: string[]; misconceptionRules: string[]; quickCheckQuestionIds: BetaId[]; recitationIds: BetaId[];
}
export interface CurriculumCatalog {
  curricula: Curriculum[]; chapters: CurriculumChapter[]; sections: CurriculumSection[];
}

const VERSION = "learning-experience-v3";
const coreSlugs = new Set(["politics"]);

function chapterReviewSection(chapter: CurriculumChapter, order: number): CurriculumSection {
  return {
    id: `${chapter.id}-review`, chapterId: chapter.id, order, knowledgePointIds: [], estimatedMinutes: 20,
    title: "章末总结与思维导图", titleEn: "Chapter summary and mind map", kind: "chapter_review",
    teaching: {
      hook: `完成“${chapter.title}”的结构化回顾。`, hookEn: `Complete a structured review of ${chapter.titleEn}.`,
      learningObjectives: ["串联本章各节", "主动回忆核心概念", "定位考点、错题与待复习内容"],
      simpleExplanation: "先从章节结构回忆各节之间的关系，再用思维导图检查遗漏。",
      formalDefinition: "章末复习把分散的小节学习证据汇总为知识结构、考点、练习、费曼复述与复习计划。",
      examples: ["先隐藏关键词复述章节框架，再切换到完整导图核对。"], counterExamples: ["只重新浏览标题，不做主动回忆。"],
      comparison: ["完整导图用于梳理；背诵模式用于主动提取；真题模式只展示已核验题目。"],
      examTips: ["从各节重点与易错点中建立本章答题框架。"], commonMistakes: ["把系统原创练习误认为历年真题。"],
      summary: `回顾${chapter.title}的各节、核心概念、考点和薄弱证据。`,
      feynmanPrompts: [`不看目录，说明${chapter.title}包含哪些部分，以及它们如何关联。`],
      requiredTerms: [chapter.title.replace(/^第\s*\d+\s*章\s*/, "")], misconceptionRules: ["章节总结不等于重复阅读。"],
    },
  };
}

function curriculumFor(subject: BetaState["subjects"][number]): Curriculum {
  const examType = subject.slug === "psychology" ? "312" : subject.slug === "politics" ? "postgraduate-politics" : subject.slug === "english" ? "english1" : "general";
  return {
    id: `curriculum-${subject.slug}`, subjectId: subject.id,
    title: subject.slug === "english" ? "考研英语一" : subject.name,
    titleEn: subject.slug === "english" ? "Postgraduate English I" : subject.nameEn,
    version: VERSION, examType,
    description: subject.slug === "english" ? "词汇、语法、阅读、翻译与写作的顺序学习路径。" : `按稳定章节顺序学习${subject.name}，完成讲解、复述、检测与复习。`,
    descriptionEn: subject.slug === "english" ? "A guided path through vocabulary, grammar, reading, translation and writing." : `A guided sequence for ${subject.nameEn}, from explanation to recall and review.`,
  };
}

export function buildCurriculumCatalog(state: BetaState): CurriculumCatalog {
  const psychologyBooks = buildPsychologyBookCatalog(state);
  const curricula = [...psychologyBooks.curricula, ...state.subjects.filter((subject) => subject.slug !== "psychology").map(curriculumFor)];
  const chapters: CurriculumChapter[] = [...psychologyBooks.chapters];
  const sections: CurriculumSection[] = [...psychologyBooks.sections];
  for (const curriculum of curricula) {
    if (curriculum.subjectId === "subject-psychology-312") continue;
    const subject = state.subjects.find((item) => item.id === curriculum.subjectId)!;
    const subjectChapters = state.chapters.filter((item) => item.subjectId === subject.id).sort((a, b) => a.order - b.order);
    if (coreSlugs.has(subject.slug)) {
      let chapterOrder = 0;
      for (const area of subjectChapters) {
        const units = state.units.filter((item) => item.chapterId === area.id).sort((a, b) => a.order - b.order);
        const areaPoints = state.knowledgePoints.filter((item) => item.subjectId === subject.id && item.chapterId === area.id);
        const validUnitIds = new Set(units.map((item) => item.id));
        for (const unit of units) {
          chapterOrder += 1;
          const chapterId = `curriculum-chapter-${unit.id}`;
          chapters.push({ id: chapterId, curriculumId: curriculum.id, sourceChapterId: area.id, sourceUnitId: unit.id, title: `${area.title} · 第 ${unit.order} 章 ${unit.title}`, titleEn: `${area.titleEn} · Chapter ${unit.order}: ${unit.titleEn}`, order: chapterOrder, description: `本章围绕${unit.title}建立概念、辨析与应试应用。`, descriptionEn: `Build concepts, distinctions and exam application for ${unit.titleEn}.` });
          const points = areaPoints.filter((item) => item.unitId === unit.id || unit === units.at(-1) && (!item.unitId || !validUnitIds.has(item.unitId)));
          points.forEach((point, index) => sections.push({ id: `curriculum-section-${point.id}`, chapterId, title: `${unit.order}.${index + 1} ${point.title}`, titleEn: `${unit.order}.${index + 1} ${point.titleEn}`, order: index + 1, knowledgePointIds: [point.id], estimatedMinutes: point.importance === 5 ? 15 : 12 }));
          sections.push(chapterReviewSection(chapters.at(-1)!, points.length + 1));
        }
      }
      continue;
    }
    if (subject.slug === "english") {
      const kinds = ["sentence", "grammar", "comprehension", "translation", "writing"] as const;
      const titles = { sentence: ["长难句", "Complex Sentences"], grammar: ["语法", "Grammar"], comprehension: ["阅读", "Reading"], translation: ["翻译", "Translation"], writing: ["写作", "Writing"] } as const;
      chapters.push({ id: "curriculum-chapter-english-vocabulary", curriculumId: curriculum.id, sourceChapterId: "english-vocabulary", title: "第 1 章 词汇", titleEn: "Chapter 1: Vocabulary", order: 1, description: "每日新词与到期复习。", descriptionEn: "Daily new words and due review." });
      sections.push({ id: "curriculum-section-english-vocabulary", chapterId: "curriculum-chapter-english-vocabulary", title: "1.1 今日词汇学习", titleEn: "1.1 Today's word study", order: 1, knowledgePointIds: [], estimatedMinutes: 20 });
      sections.push(chapterReviewSection(chapters.at(-1)!, 2));
      kinds.forEach((kind, index) => {
        const chapterId = `curriculum-chapter-english-${kind}`;
        chapters.push({ id: chapterId, curriculumId: curriculum.id, sourceChapterId: "english-reading", title: `第 ${index + 2} 章 ${titles[kind][0]}`, titleEn: `Chapter ${index + 2}: ${titles[kind][1]}`, order: index + 2, description: `通过讲解、尝试与反馈学习${titles[kind][0]}。`, descriptionEn: `Learn ${titles[kind][1].toLowerCase()} through explanation, attempts and feedback.` });
        const contentItems=state.englishContent.filter((item) => item.kind === kind);
        contentItems.forEach((item, itemIndex) => sections.push({ id: `curriculum-section-${item.id}`, chapterId, title: `${index + 2}.${itemIndex + 1} ${item.title}`, titleEn: `${index + 2}.${itemIndex + 1} ${item.title}`, order: itemIndex + 1, knowledgePointIds: [], englishContentIds: [item.id], estimatedMinutes: kind === "sentence" ? 12 : 15 }));
        sections.push(chapterReviewSection(chapters.at(-1)!, contentItems.length + 1));
      });
      continue;
    }
    subjectChapters.forEach((source, index) => {
      const chapterId = `curriculum-chapter-${source.id}`;
      chapters.push({ id: chapterId, curriculumId: curriculum.id, sourceChapterId: source.id, title: `第 ${index + 1} 章 ${source.title}`, titleEn: `Chapter ${index + 1}: ${source.titleEn}`, order: index + 1, description: `循序学习${source.title}的概念、方法与应用。`, descriptionEn: `Study the concepts, methods and applications of ${source.titleEn}.` });
      const points=state.knowledgePoints.filter((item) => item.chapterId === source.id);
      points.forEach((point, pointIndex) => sections.push({ id: `curriculum-section-${point.id}`, chapterId, title: `${index + 1}.${pointIndex + 1} ${point.title}`, titleEn: `${index + 1}.${pointIndex + 1} ${point.titleEn}`, order: pointIndex + 1, knowledgePointIds: [point.id], estimatedMinutes: 12 }));
      sections.push(chapterReviewSection(chapters.at(-1)!, points.length + 1));
    });
  }
  return { curricula, chapters, sections };
}

function compactTerms(point: BetaState["knowledgePoints"][number]): string[] {
  const source = [point.title, ...(point.tags ?? []).filter((item) => !item.startsWith("psych-") && !item.startsWith("politics-")).slice(0, 3), ...(point.coreConcepts ?? []).filter((item) => item.length <= 12)];
  return [...new Set(source.map((item) => item.trim()).filter((item) => item.length >= 2))].slice(0, 5);
}

export function buildTeachingUnit(state: BetaState, section: CurriculumSection): TeachingUnit | null {
  if (section.id === "curriculum-section-english-vocabulary") return {
    sectionId: section.id, hook: "今天先建立可持续的词汇学习节奏：少量新词、到期复习、主动回忆，而不是一次浏览整本词库。", hookEn: "Build a sustainable vocabulary routine: a small set of new words, due review, and active recall instead of scanning the entire list.",
    learningObjectives: ["完成一组 10–15 个单词", "用听读、英中、中英和填空主动回忆", "根据 Again / Hard / Good / Easy 安排复习"],
    simpleExplanation: "每次只处理一个词：先看与听，再在隐藏答案后主动回忆。反馈按钮会进入现有 Review Engine，决定下一次出现时间。",
    formalDefinition: "词汇学习以主动提取和间隔复习为核心；学习结果保存为词条进度与复习队列，而不是浏览次数。",
    examples: ["看到 abandon 后先说出“放弃”，再从中文反向拼写 abandon，最后在例句空格中提取。"], counterExamples: ["连续滚动浏览 1000 个词却不做回忆，不能证明已经掌握。"], comparison: ["Good 表示较顺利回忆；Hard 表示勉强回忆；Again 表示需要很快重现。"], examTips: ["优先掌握语境义、固定搭配和例句中的用法。"], commonMistakes: ["只认得词形却不能回忆含义；只背中文而不会放回句子。"], summary: "少量新词 + 主动回忆 + 间隔复习，形成每天可持续的词汇闭环。", feynmanPrompts: ["请解释为什么“看过一个词”不等于“能主动提取这个词”。"], requiredTerms: ["主动回忆", "间隔复习"], misconceptionRules: ["浏览次数不等于掌握程度。"], quickCheckQuestionIds: state.questions.filter((item) => item.subjectId === "subject-english").slice(0, 3).map((item) => item.id), recitationIds: [],
  };
  const points = section.knowledgePointIds.map((id) => state.knowledgePoints.find((item) => item.id === id)).filter(Boolean) as BetaState["knowledgePoints"];
  if (section.teaching) {
    const pointIds = new Set(section.knowledgePointIds);
    const dedicated = state.questions.filter((item) => item.knowledgePointId && pointIds.has(item.knowledgePointId)).map((item) => item.id);
    return { sectionId: section.id, ...section.teaching, quickCheckQuestionIds: dedicated.slice(0, 5), recitationIds: state.recitations.filter((item) => item.knowledgePointId && pointIds.has(item.knowledgePointId)).map((item) => item.id) };
  }
  if (points.length) {
    const point = points[0]; const questions = state.questions.filter((item) => section.knowledgePointIds.includes(item.knowledgePointId ?? "")).slice(0, 5);
    const exampleDefaults: Record<string, string> = {
      "kp-sensation-threshold": "在安静房间里把声音从几乎听不见逐渐调大；第一次觉得“好像听到了”时的刺激强度，就是一次绝对感觉阈限测量。",
      "kp-working-memory": "看到验证码 583921 后，在几秒内保持它并输入：你既暂存信息，也对信息执行了操作。",
      "kp-reinforcement": "完成一组练习后获得休息时间，使练习行为更可能再次出现；关键看行为概率是否上升。",
      "kp-marx-practice": "一种学习方法是否有效，最终要回到真实学习与测验中检验，而不能只看它听起来是否合理。",
    };
    const examples = point.examples?.length ? point.examples : [exampleDefaults[point.id] ?? `把“${point.title}”放进一个具体情境：先指出对象与条件，再用${point.coreConcept}解释结果。`];
    return { sectionId: section.id, hook: `今天我们学习“${point.title}”。先理解它解决什么问题，再记住正式表述。`, hookEn: `Today you will learn ${point.titleEn}. Start with the problem it explains, then learn the formal wording.`, learningObjectives: [`用自己的话解释${point.title}`, `识别${point.title}的成立条件`, `避开常见混淆并完成即时检测`], simpleExplanation: point.explanation ?? point.coreConcept, formalDefinition: point.definition ?? point.coreConcept, examples, counterExamples: [`如果忽略适用条件，直接把“${point.title}”用于所有相似现象，就不是正确应用。`], comparison: point.comparisons?.length ? point.comparisons : [point.pitfalls], examTips: point.examFocus?.length ? point.examFocus : [point.keyPoints], commonMistakes: point.commonMistakes?.length ? point.commonMistakes : [point.pitfalls], summary: point.summary ?? `${point.coreConcept} ${point.keyPoints}`, feynmanPrompts: [`不看上面的内容，假设对方完全不了解${point.title}。请用自己的话解释它，并给一个例子。`], requiredTerms: compactTerms(point), misconceptionRules: [point.pitfalls], quickCheckQuestionIds: questions.map((item) => item.id), recitationIds: state.recitations.filter((item) => item.knowledgePointId && section.knowledgePointIds.includes(item.knowledgePointId)).map((item) => item.id) };
  }
  const content = section.englishContentIds?.map((id) => state.englishContent.find((item) => item.id === id)).find(Boolean);
  if (!content) return null;
  const parts = content.content.split(/\n\n/).map((item) => item.trim()).filter(Boolean);
  return { sectionId: section.id, hook: `今天用一小节掌握“${content.title}”。先尝试，再拆解，最后自己说清方法。`, hookEn: `Learn ${content.title} in one focused lesson: try, analyze, then explain the method yourself.`, learningObjectives: ["识别核心结构", "说明判断依据", "把方法用于新的表达"], simpleExplanation: parts[0] ?? content.content, formalDefinition: parts.find((item) => item.startsWith("Clause structure") || item.startsWith("Main clause")) ?? content.content, examples: [parts[0] ?? content.content], counterExamples: ["只按单词顺序逐词翻译，通常会破坏原句的逻辑关系。"], comparison: ["先找主干，再处理从句与修饰；不要把所有成分放在同一层级。"], examTips: ["先完成自己的判断，再展开解析并核对证据。"], commonMistakes: ["看到熟词就立即选答案，没有回到句子结构和上下文。"], summary: content.title, feynmanPrompts: [`请解释你如何判断“${content.title}”中的主干、修饰和逻辑关系。`], requiredTerms: content.title.split(/\s+/).filter((item) => item.length > 2).slice(0, 4), misconceptionRules: ["不能只给翻译结果，需要说明判断依据。"], quickCheckQuestionIds: [], recitationIds: [] };
}
