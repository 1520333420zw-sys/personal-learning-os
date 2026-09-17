import type {
  BetaChapter,
  BetaEntity,
  BetaKnowledgePoint,
  BetaQuestion,
  BetaState,
  BetaSubject,
  OwnerId,
} from "@/domain/beta";
import { createOutlineUnits } from "./learning-outline";
import { CORE_CONTENT_VERSION, createCoreKnowledgePoints, createCoreQuestions, createCoreSubjectiveQuestions } from "@/data/content-packs/core";
import { UNIVERSAL_CONTENT_VERSION, createUniversalContent } from "@/data/content-packs/universal";
import { toLocalDateKey } from "@/lib/date";

export const BETA_STORAGE_KEY = "personal-learning-os:beta:v1";
export const LOCAL_OWNER_ID: OwnerId = "local-owner";

export function createBetaId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createBetaEntity(id: string, ownerId = LOCAL_OWNER_ID): BetaEntity {
  const now = new Date().toISOString();
  return { id, ownerId, createdAt: now, updatedAt: now };
}

function subject(id: string, slug: BetaSubject["slug"], name: string, nameEn: string): BetaSubject {
  return { ...createBetaEntity(id), slug, name, nameEn };
}

function chapter(id: string, subjectId: string, title: string, titleEn: string, order: number): BetaChapter {
  return { ...createBetaEntity(id), subjectId, title, titleEn, order };
}

function knowledge(
  id: string,
  subjectId: string,
  chapterId: string,
  title: string,
  titleEn: string,
  coreConcept: string,
  keyPoints: string,
  pitfalls: string,
): BetaKnowledgePoint {
  return {
    ...createBetaEntity(id), subjectId, chapterId, title, titleEn, coreConcept, keyPoints, pitfalls,
    personalNote: "", mastery: "new", favorite: false,
  };
}

function question(
  id: string,
  subjectId: string,
  chapterId: string,
  knowledgePointId: string,
  stem: string,
  options: { id: string; text: string }[],
  answer: string[],
  explanation: string,
  type: BetaQuestion["questionType"] = "single",
): BetaQuestion {
  return {
    ...createBetaEntity(id), subjectId, chapterId, knowledgePointId,
    examType: "system-practice", questionType: type, stem, options, answer, explanation,
    difficulty: "easy", source: "Personal Learning OS 系统原创练习题", tags: ["系统练习题"],
  };
}

export function createInitialBetaState(): BetaState {
  const universal = createUniversalContent();
  const psychology = "subject-psychology-312";
  const politics = "subject-politics";
  const english = "subject-english";
  const subjects = [
    subject(psychology, "psychology", "312 心理学", "312 Psychology"),
    subject(politics, "politics", "政治", "Politics"),
    subject(english, "english", "英语", "English"),
    ...universal.subjects,
  ];
  const chapters = [
    chapter("psych-general", psychology, "普通心理学", "General Psychology", 1),
    chapter("psych-social", psychology, "社会心理学", "Social Psychology", 2),
    chapter("psych-development", psychology, "发展心理学", "Developmental Psychology", 3),
    chapter("psych-education", psychology, "教育心理学", "Educational Psychology", 4),
    chapter("psych-experimental", psychology, "实验心理学", "Experimental Psychology", 5),
    chapter("psych-statistics", psychology, "心理统计", "Psychological Statistics", 6),
    chapter("psych-measurement", psychology, "心理测量", "Psychological Measurement", 7),
    chapter("politics-marxism", politics, "马克思主义基本原理", "Fundamentals of Marxism", 1),
    chapter("politics-theory", politics, "毛泽东思想和中国特色社会主义理论体系", "Mao Zedong Thought and Theoretical System", 2),
    chapter("politics-xi", politics, "习近平新时代中国特色社会主义思想", "Xi Jinping Thought", 3),
    chapter("politics-history", politics, "中国近现代史纲要", "Modern Chinese History", 4),
    chapter("politics-ethics", politics, "思想道德与法治", "Morality and Rule of Law", 5),
    chapter("politics-current", politics, "形势与政策 / 当代时政", "Current Affairs", 6),
    chapter("english-vocabulary", english, "词汇", "Vocabulary", 1),
    chapter("english-reading", english, "阅读", "Reading", 2),
    ...universal.chapters,
  ];
  const knowledgePoints = [
    knowledge("kp-sensation-threshold", psychology, "psych-general", "感觉阈限", "Sensory Thresholds", "感觉阈限描述刺激强度与感觉产生之间的界限。", "区分绝对阈限与差别阈限。", "不要把阈限理解为固定不变的单一数值。"),
    knowledge("kp-working-memory", psychology, "psych-general", "工作记忆", "Working Memory", "工作记忆用于暂时保持并加工当前任务所需的信息。", "关注容量限制、中央执行系统与子系统。", "工作记忆不等同于所有短时记忆现象。"),
    knowledge("kp-reinforcement", psychology, "psych-education", "强化", "Reinforcement", "强化通过结果提高行为再次发生的概率。", "正强化增加刺激，负强化移除刺激。", "负强化不是惩罚。"),
    knowledge("kp-experiment-variables", psychology, "psych-experimental", "实验变量", "Experimental Variables", "实验通过操纵自变量观察因变量变化，并控制混淆变量。", "操作定义和控制变量决定可解释性。", "相关关系不能直接推出因果关系。"),
    knowledge("kp-marx-practice", politics, "politics-marxism", "实践与认识", "Practice and Knowledge", "实践是认识的来源、动力、目的和检验标准。", "认识经历从实践到认识、再回到实践的过程。", "避免割裂理论与实践。"),
    knowledge("kp-contradiction", politics, "politics-marxism", "矛盾的普遍性与特殊性", "Universality and Particularity of Contradiction", "矛盾具有普遍性，具体矛盾又有其特殊性。", "分析具体问题时把一般原理与具体条件结合。", "不能用抽象共性替代具体分析。"),
    knowledge("kp-modern-history", politics, "politics-history", "近代中国社会性质", "Modern Chinese Social Conditions", "理解近代中国社会结构及主要矛盾是分析历史任务的基础。", "把历史阶段、主要矛盾与任务联系起来。", "避免脱离时代条件评价历史事件。"),
  ];
  const pointUnits: Record<string, string> = {
    "kp-sensation-threshold": "unit-psych-general-3", "kp-working-memory": "unit-psych-general-6",
    "kp-reinforcement": "unit-psych-education-2", "kp-experiment-variables": "unit-psych-experimental-2",
    "kp-marx-practice": "unit-politics-marxism-4", "kp-contradiction": "unit-politics-marxism-3",
    "kp-modern-history": "unit-politics-history-1",
  };
  for (const point of knowledgePoints) point.unitId = pointUnits[point.id];
  const systemPoints = createCoreKnowledgePoints();
  const allKnowledgePoints = [...new Map([...knowledgePoints, ...systemPoints, ...universal.points].map((point) => [point.id, point])).values()];
  const questions = [
    question("q-psych-1", psychology, "psych-general", "kp-sensation-threshold", "刚好能够引起感觉的最小刺激量通常称为？", [{id:"a",text:"绝对感觉阈限"},{id:"b",text:"差别阈限"},{id:"c",text:"适应水平"},{id:"d",text:"信号强度"}], ["a"], "绝对感觉阈限指刚好能够引起感觉的最小刺激量。"),
    question("q-psych-2", psychology, "psych-general", "kp-working-memory", "工作记忆的主要特点是？", [{id:"a",text:"永久保存信息"},{id:"b",text:"暂时保持并加工信息"},{id:"c",text:"只保存视觉信息"},{id:"d",text:"容量无限"}], ["b"], "工作记忆同时承担短时保持和加工，且容量有限。"),
    question("q-psych-3", psychology, "psych-education", "kp-reinforcement", "负强化通过移除厌恶刺激来提高行为出现概率。", [{id:"true",text:"正确"},{id:"false",text:"错误"}], ["true"], "负强化的结果仍是行为增加，它与惩罚不同。", "true_false"),
    question("q-politics-1", politics, "politics-marxism", "kp-marx-practice", "检验认识真理性的根本标准是？", [{id:"a",text:"逻辑形式"},{id:"b",text:"多数人的意见"},{id:"c",text:"社会实践"},{id:"d",text:"权威结论"}], ["c"], "实践把主观认识与客观实际联系起来，是检验真理性的根本标准。"),
    question("q-politics-2", politics, "politics-marxism", "kp-contradiction", "分析具体问题时应当把矛盾的普遍性和特殊性结合起来。", [{id:"true",text:"正确"},{id:"false",text:"错误"}], ["true"], "一般原理要通过具体条件发挥作用，因此需要具体问题具体分析。", "true_false"),
    question("q-politics-3", politics, "politics-history", "kp-modern-history", "学习历史阶段时，较合理的分析路径包括哪些？", [{id:"a",text:"社会性质"},{id:"b",text:"主要矛盾"},{id:"c",text:"历史任务"},{id:"d",text:"只记年份"}], ["a","b","c"], "社会性质、主要矛盾和历史任务相互关联，单纯记忆年份不足以解释历史进程。", "multiple"),
    question("q-english-1", english, "english-vocabulary", "", "Choose the word closest in meaning to ‘concise’.", [{id:"a",text:"brief"},{id:"b",text:"uncertain"},{id:"c",text:"ancient"},{id:"d",text:"complex"}], ["a"], "Concise means brief and clearly expressed."),
    question("q-english-2", english, "english-reading", "", "Which sentence is grammatically correct?", [{id:"a",text:"She have finished."},{id:"b",text:"She has finished."},{id:"c",text:"She finishing."},{id:"d",text:"She finish yesterday."}], ["b"], "The third-person singular present perfect form is ‘has finished’."),
    question("q-english-3", english, "english-vocabulary", "", "The word ‘evaluate’ most nearly means to assess something carefully.", [{id:"true",text:"True"},{id:"false",text:"False"}], ["true"], "Evaluate means to judge or assess quality, value, or significance.", "true_false"),
  ];
  const recitationPoints = chapters.filter((entry) => entry.subjectId === psychology || entry.subjectId === politics).map((entry) =>
    systemPoints.filter((point) => point.chapterId === entry.id).sort((left, right) => (right.importance ?? 0) - (left.importance ?? 0))[0]
  ).filter((point): point is BetaKnowledgePoint => Boolean(point));
  const initialRecitations = recitationPoints.map((point) => ({
    ...createBetaEntity(`recitation-${point.id}`), title: point.title, category: chapters.find((entry) => entry.id === point.chapterId)?.title ?? "",
    content: `${point.coreConcept}\n${point.keyPoints}`, status: "today" as const, favorite: false, nextReviewAt: toLocalDateKey(new Date()),
    subjectId: point.subjectId, chapterId: point.chapterId, knowledgePointId: point.id, type: "knowledge" as const,
    reviewCount: 0, mastery: "new" as const,
  }));
  return {
    version: 3, ownerId: LOCAL_OWNER_ID, subjects, chapters, units: createOutlineUnits(), knowledgePoints: allKnowledgePoints,
    tasks: [], studySessions: [], pomodoroSessions: [], studyProgress: [], reviewItems: [], questions: [...questions, ...createCoreQuestions(), ...universal.questions], questionAttempts: [], wrongQuestions: [],
    favorites: [], vocabulary: [], reading: [], readingNotes: [], recitations: initialRecitations, notes: [], books: [],
    englishContent: [], subjectiveQuestions: createCoreSubjectiveQuestions(), currentAffairs: [], pdfDocuments: [], pdfNotes: [], resources: [],
    habits: [], exercises: [], sleep: [], finance: [], goals: [],
    contentPacks: { core: CORE_CONTENT_VERSION, universal: UNIVERSAL_CONTENT_VERSION },
  };
}

export function loadBetaState(): BetaState {
  if (typeof window === "undefined") return createInitialBetaState();
  const raw = window.localStorage.getItem(BETA_STORAGE_KEY);
  if (!raw) return createInitialBetaState();
  try {
    const value: unknown = JSON.parse(raw);
    if (!isBetaState(value)) throw new Error("Invalid beta data");
    return migrateBetaState(value);
  } catch {
    return createInitialBetaState();
  }
}

export function saveBetaState(state: BetaState): void {
  const packagedPointIds = new Set(createInitialBetaState().knowledgePoints.filter((point) => point.contentVersion).map((point) => point.id));
  const packagedQuestionIds = new Set([...createCoreQuestions(), ...createUniversalContent().questions].map((question) => question.id));
  const packagedWrittenIds = new Set(createCoreSubjectiveQuestions().map((question) => question.id));
  const contentPointState = Object.fromEntries(state.knowledgePoints.filter((point) => packagedPointIds.has(point.id)).map((point) => [point.id, {
    personalNote: point.personalNote, mastery: point.mastery, favorite: point.favorite,
    lastStudiedAt: point.lastStudiedAt, nextReviewAt: point.nextReviewAt,
  }]));
  const contentWrittenAnswers = Object.fromEntries(state.subjectiveQuestions.filter((question) => packagedWrittenIds.has(question.id)).map((question) => [question.id, question.ownAnswer]));
  // Keep immutable content-pack text out of the user's local data key. Only personal overlays persist.
  window.localStorage.setItem(BETA_STORAGE_KEY, JSON.stringify({ ...state,
    knowledgePoints: state.knowledgePoints.filter((point) => !packagedPointIds.has(point.id)),
    questions: state.questions.filter((question) => !packagedQuestionIds.has(question.id)),
    subjectiveQuestions: state.subjectiveQuestions.filter((question) => !packagedWrittenIds.has(question.id)),
    contentPointState, contentWrittenAnswers,
  }));
}

export function isBetaState(value: unknown): value is BetaState | (Omit<BetaState, "version" | "units" | "englishContent" | "subjectiveQuestions" | "currentAffairs" | "pdfDocuments" | "pdfNotes"> & { version: 1 | 2 }) {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { version?: number; ownerId?: unknown; subjects?: unknown; tasks?: unknown; studySessions?: unknown; notes?: unknown };
  return (candidate.version === 1 || candidate.version === 2 || candidate.version === 3) && typeof candidate.ownerId === "string" &&
    Array.isArray(candidate.subjects) && Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.studySessions) && Array.isArray(candidate.notes);
}

export function migrateBetaState(value: unknown): BetaState {
  if (!isBetaState(value)) throw new Error("Invalid beta data");
  const initial = createInitialBetaState();
  const prior = value as Partial<BetaState> & { contentPointState?: Record<string, Pick<BetaKnowledgePoint, "personalNote" | "mastery" | "favorite" | "lastStudiedAt" | "nextReviewAt">>; contentWrittenAnswers?: Record<string, string> };
  const mergeCatalog = <T extends { id: string }>(saved: T[] | undefined, defaults: T[]) => {
    const ids = new Set((saved ?? []).map((item) => item.id));
    return [...(saved ?? []), ...defaults.filter((item) => !ids.has(item.id))];
  };
  const savedPoints = new Map((prior.knowledgePoints ?? []).map((point) => [point.id, point]));
  const mergedPoints = mergeCatalog(prior.knowledgePoints, initial.knowledgePoints).map((point) => {
    const packaged = initial.knowledgePoints.find((seed) => seed.id === point.id);
    const saved = savedPoints.get(point.id);
    if (!packaged) return point;
    const overlay = prior.contentPointState?.[point.id];
    return { ...point, ...packaged, ownerId: saved?.ownerId ?? point.ownerId,
      createdAt: saved?.createdAt ?? point.createdAt, personalNote: overlay?.personalNote ?? saved?.personalNote ?? "",
      mastery: overlay?.mastery ?? saved?.mastery ?? "new", favorite: overlay?.favorite ?? saved?.favorite ?? false,
      lastStudiedAt: overlay?.lastStudiedAt ?? saved?.lastStudiedAt, nextReviewAt: overlay?.nextReviewAt ?? saved?.nextReviewAt };
  });
  return {
    ...initial, ...prior, version: 3,
    subjects: mergeCatalog(prior.subjects, initial.subjects),
    chapters: mergeCatalog(prior.chapters, initial.chapters),
    units: mergeCatalog(prior.units, initial.units),
    knowledgePoints: mergedPoints,
    questions: mergeCatalog(prior.questions, initial.questions),
    tasks: prior.tasks ?? [], studySessions: prior.studySessions ?? [],
    reviewItems: prior.reviewItems ?? [], questionAttempts: prior.questionAttempts ?? [],
    wrongQuestions: prior.wrongQuestions ?? [], favorites: prior.favorites ?? [],
    vocabulary: prior.vocabulary ?? [], reading: prior.reading ?? [],
    recitations: prior.contentPacks?.core === CORE_CONTENT_VERSION ? (prior.recitations ?? []) : mergeCatalog(prior.recitations, initial.recitations), notes: prior.notes ?? [], books: prior.books ?? [],
    resources: prior.resources ?? [], habits: prior.habits ?? [], exercises: prior.exercises ?? [],
    sleep: prior.sleep ?? [], finance: prior.finance ?? [], goals: prior.goals ?? [],
    englishContent: prior.englishContent ?? [], subjectiveQuestions: mergeCatalog(prior.subjectiveQuestions, initial.subjectiveQuestions).map((question) => {
      const packaged = initial.subjectiveQuestions.find((seed) => seed.id === question.id);
      return { ...question, ...packaged, ownAnswer: prior.contentWrittenAnswers?.[question.id] ?? question.ownAnswer };
    }), currentAffairs: prior.currentAffairs ?? [],
    pdfDocuments: prior.pdfDocuments ?? [], pdfNotes: prior.pdfNotes ?? [],
    pomodoroSessions: prior.pomodoroSessions ?? [], studyProgress: prior.studyProgress ?? [],
    readingNotes: prior.readingNotes ?? [],
    contentPacks: initial.contentPacks,
  };
}
