import type { BetaKnowledgePoint, BetaQuestion, BetaSubjectiveQuestion } from "@/domain/beta";

// Original, introductory explanations. These are system priorities, not past-paper statistics.
type Seed = [id: string, title: string, english: string, concept: string, explanation: string, key: string, pitfall: string];
const chapters: Record<string, Seed[]> = {
  "psych-general": [
    ["sensation-threshold", "感觉阈限", "Sensory threshold", "感觉阈限是刺激强度与感觉产生之间的临界范围。", "绝对阈限讨论能否觉察刺激；差别阈限讨论能否觉察两个刺激之间的变化。阈限会随情境和个体状态变化。", "比较绝对阈限与差别阈限，并区分刺激量与感受性。", "阈限越低通常表示感受性越高，不能把两者同向理解。"],
    ["perceptual-constancy", "知觉恒常性", "Perceptual constancy", "知觉恒常性指感官输入变化时，对物体某些属性保持相对稳定的知觉。", "距离变化会改变视网膜成像大小，但熟悉物体通常不会被知觉为突然变小。", "理解大小、形状和颜色恒常性的情境条件。", "恒常性是相对稳定，不表示知觉完全不受环境影响。"],
    ["working-memory", "工作记忆", "Working memory", "工作记忆暂时保持并加工当前任务所需的信息。", "它把短时保持与主动加工联系起来；复杂任务会受到有限容量约束。", "区分工作记忆与单纯的短时存储。", "工作记忆不是容量无限的长期记忆。"],
    ["attention", "选择性注意", "Selective attention", "选择性注意是在有限处理资源下优先处理部分信息。", "注意选择帮助当前目标相关信息进入深入加工，也可能使未注意信息被忽略。", "联系注意分配与任务目标。", "未注意到不等于刺激不存在。"],
  ],
  "psych-social": [
    ["attribution", "归因", "Attribution", "归因是对行为原因作出解释的过程。", "解释他人行为时，人们可能侧重个体特征，也可能考虑情境限制。", "比较内部归因与外部归因。", "不要把一次行为直接等同于稳定人格。"],
    ["attitude", "态度的构成", "Components of attitude", "态度通常包含认知、情感和行为倾向。", "一个人知道某行为有益、喜欢它、愿意实施，属于不同层面的反应。", "结合具体案例区分三个成分。", "行为倾向不保证实际行为一定发生。"],
    ["conformity", "从众", "Conformity", "从众是个体受群体影响而调整判断或行为。", "规范性影响与信息性影响可导致相似外在行为，但动机不同。", "区分群体压力与寻求正确信息。", "从众不必然意味着私下认同。"],
  ],
  "psych-development": [
    ["development", "发展与变化", "Development and change", "心理发展涉及个体随时间发生的连续与阶段性变化。", "研究发展需要同时考虑生物成熟、经验及社会文化条件。", "比较纵向研究与横断研究的证据边界。", "年龄相关不自动证明年龄本身是原因。"],
    ["attachment", "依恋", "Attachment", "依恋是儿童与照料者形成的持续情感联结。", "稳定、敏感的照料有助于建立安全感；依恋表现需要结合情境观察。", "理解依恋与早期互动质量的关系。", "不能仅凭一次分离反应判断完整依恋类型。"],
    ["adolescence", "青少年自我同一性", "Adolescent identity", "自我同一性涉及对自身角色、价值和未来方向的整合。", "探索与承诺是分析同一性发展的两个重要维度。", "结合社会关系和发展任务理解探索过程。", "不要将探索简单视为异常或失败。"],
  ],
  "psych-education": [
    ["reinforcement", "强化", "Reinforcement", "强化是结果使某行为未来发生概率提高的过程。", "正强化加入刺激；负强化移除厌恶刺激，两者都使目标行为增加。", "按行为发生概率判断强化，而非按刺激好坏命名。", "负强化不是惩罚。"],
    ["transfer", "学习迁移", "Transfer of learning", "学习迁移是已有学习对新学习或表现的影响。", "迁移可以促进，也可以干扰；识别共同结构有助于正迁移。", "比较正迁移与负迁移。", "两个任务表面相似不保证有效迁移。"],
    ["metacognition", "元认知", "Metacognition", "元认知是对自身认知过程的认识与调节。", "学习者可计划策略、监控理解并依据反馈调整方法。", "把计划、监控和评价放在完整学习循环中理解。", "反复阅读不等于有效监控是否理解。"],
  ],
  "psych-experimental": [
    ["variables", "自变量与因变量", "Independent and dependent variables", "自变量是研究者操纵或比较的条件；因变量是被观察的结果。", "实验要把概念操作化，并尽量控制可能影响因变量的混淆因素。", "在研究案例中识别操纵、测量与控制。", "相关关系本身不能证明因果关系。"],
    ["random-assignment", "随机分配", "Random assignment", "随机分配通过随机机制安排参与者进入不同实验条件。", "它有助于平衡潜在个体差异，但不能保证小样本中各组完全相同。", "区分随机抽样与随机分配的目的。", "随机分配不等于样本代表总体。"],
    ["reaction-time", "反应时", "Reaction time", "反应时是从刺激呈现到反应发生的时间间隔。", "反应时可以间接反映加工过程，但也受速度与准确性权衡影响。", "解释结果时同时检查错误率。", "反应更快不必然表示认知加工更好。"],
  ],
  "psych-statistics": [
    ["standard-deviation", "标准差", "Standard deviation", "标准差描述数据围绕均值的离散程度。", "计算依赖每个观测值与均值的偏差；单位与原始变量一致。", "比较标准差与方差的含义和单位。", "标准差大不直接说明平均水平更高。"],
    ["confidence-interval", "置信区间", "Confidence interval", "置信区间是按既定程序由样本构造的参数估计范围。", "若同一抽样程序反复进行，按标称置信水平构造的区间会以相应长期比例覆盖固定参数。", "区分长期覆盖率与单个区间的概率表述。", "不要把已算出的固定区间解读为参数随机落入的概率。"],
    ["p-value", "p 值", "P-value", "p 值是在零假设及检验模型成立条件下，得到当前或更极端结果的概率。", "它衡量数据与零假设的相容程度，不直接给出效应大小。", "结合效应量、区间估计和研究设计解释结果。", "p 值不是零假设为真的概率。"],
  ],
  "psych-measurement": [
    ["reliability", "信度", "Reliability", "信度反映测量结果的一致性或稳定性。", "重测、内部一致性等方法关注不同误差来源。", "根据测量目的选择恰当的信度证据。", "高信度不保证测到了原本想测的构念。"],
    ["validity", "效度", "Validity", "效度关注分数解释及其用途是否有充分证据支持。", "内容、结构及与外部变量的关系都可提供相关证据。", "把效度与具体解释和使用情境联系起来。", "不要将某一个系数当作所有用途的永久效度证明。"],
    ["norms", "常模", "Norms", "常模提供将个体分数与指定参照群体比较的依据。", "解释常模分数必须确认参照样本与当前受测者是否适配。", "区分原始分数和相对位置。", "不同常模群体下同一原始分数的解释可能不同。"],
  ],
  "politics-marxism": [
    ["practice", "实践与认识", "Practice and knowledge", "实践是认识的来源、动力、目的，也是检验真理的重要标准。", "认识从实践中产生，又在实践中接受检验和发展。", "说明实践与认识的双向关系。", "不能把理论学习与实践活动机械割裂。"],
    ["contradiction", "矛盾的普遍性与特殊性", "Universality and particularity", "矛盾具有普遍性，不同事物及同一事物不同阶段又有特殊性。", "分析问题应把一般原理与具体条件结合。", "用具体案例解释共性与个性的关系。", "不能以抽象共性代替具体分析。"],
    ["productive-forces", "生产力与生产关系", "Productive forces and relations", "生产力与生产关系共同构成生产方式的两个方面。", "生产力的发展要求生产关系与之相适应；两者之间存在相互作用。", "联系历史条件分析制度变迁。", "避免把复杂历史变化简化为单一因素。"],
  ],
  "politics-theory": [
    ["new-democracy", "新民主主义革命", "New democratic revolution", "新民主主义革命是在特定历史条件下展开的反帝反封建革命。", "理解革命的对象、动力、领导力量和前途之间的联系。", "区分革命阶段与最终社会目标。", "不能脱离当时社会性质解释革命任务。"],
    ["socialist-transformation", "社会主义改造", "Socialist transformation", "社会主义改造涉及生产资料所有制结构的历史性变化。", "应结合当时经济社会条件理解改造路径和阶段。", "区分改造目标、政策工具与历史结果。", "不要把不同领域的改造过程视作完全相同。"],
    ["reform-opening", "改革开放", "Reform and opening up", "改革开放是中国社会主义现代化进程中的重要历史转折。", "理解改革、发展与制度建设之间的关系。", "把政策变化置于具体历史阶段。", "不能把改革理解为简单否定此前全部发展。"],
  ],
  "politics-xi": [
    ["modernization", "中国式现代化", "Chinese modernization", "中国式现代化是立足中国国情推进现代化建设的理论与实践命题。", "学习时应区分目标、路径、制度条件与具体政策。", "从经济、社会、生态等维度理解整体推进。", "避免用单一经济指标概括现代化。"],
    ["high-quality", "高质量发展", "High-quality development", "高质量发展强调发展质量与效益，并关注创新、协调、绿色、开放、共享。", "评价发展需要兼顾结构、效率、可持续性和人民生活。", "解释发展理念之间的关联。", "高质量发展不等同于单纯追求增长速度。"],
    ["ecology", "生态文明建设", "Ecological civilization", "生态文明建设强调经济社会发展与生态环境保护相协调。", "环境治理涉及制度、技术和公众参与。", "结合具体政策分析保护与发展的关系。", "不能把生态问题仅理解为个体行为问题。"],
  ],
  "politics-history": [
    ["social-conditions", "近代中国社会性质", "Modern Chinese social conditions", "认识近代中国社会性质是分析主要矛盾与历史任务的起点。", "把外部冲击、社会结构与不同历史力量放在同一背景下理解。", "连结社会性质、主要矛盾与历史任务。", "不要只记事件年份而忽视背景。"],
    ["1911", "辛亥革命", "1911 Revolution", "辛亥革命推动了清朝统治的结束与共和观念的传播。", "评价历史作用时既要看到制度和观念变化，也要分析其未解决的问题。", "比较历史贡献与局限。", "不能把推翻帝制等同于完成全部社会变革。"],
    ["reform-era", "改革开放的历史进程", "Historical reform era", "改革开放改变了中国经济社会发展路径。", "理解不同阶段政策与社会变化之间的关系。", "用阶段性证据分析发展，而非套用单一结论。", "不要混淆历史阶段的先后与政策目标。"],
  ],
  "politics-ethics": [
    ["values", "价值观与人生选择", "Values and life choices", "价值观影响个体对目标、责任与行为的判断。", "分析价值选择时需要区分个人偏好、社会规范与公共责任。", "结合现实情境讨论价值判断。", "不能把价值讨论简化为口号记忆。"],
    ["morality", "道德与法治", "Morality and rule of law", "道德与法律都是社会规范，但形成、约束与实施方式不同。", "二者在公共生活中相互支持，也各有作用边界。", "比较道德评价与法律责任。", "不道德行为未必当然违法。"],
    ["rights-duties", "权利与义务", "Rights and duties", "权利与义务在法律关系中相互联系。", "理解具体权利应同时考察适用主体、条件和相应责任。", "用情境案例说明边界。", "权利行使不是不受任何限制。"],
  ],
  "politics-current": [
    ["source-verification", "时政来源核验", "Current-affairs source checks", "时政学习首先确认事件、发布日期和原始来源。", "优先阅读可追溯的原文，再区分报道事实、评论观点与个人推测。", "记录来源、时间和原文链接。", "不能把未经核实的网络说法当成今日时政。"],
    ["event-link", "事件与理论关联", "Connecting events to theory", "把已核实事件与政治理论中的具体概念建立可解释的联系。", "关联应说明事件事实如何对应理论要点，同时保留不确定性。", "先核对事实，再解释考点。", "相关性不代表该事件一定会成为考试题。"],
    ["timeline", "时政时间线", "Current-affairs timeline", "时间线用于区分事件发生、政策发布与媒体报道三个时间。", "同一事件的后续进展可能改变早期判断。", "持续记录来源与更新日期。", "不能把旧报道当作最新进展。"],
  ],
};

export const CORE_CONTENT_VERSION = "2026.09-core-2";
const legacyIds: Record<string, string> = {
  "psych-general:sensation-threshold": "kp-sensation-threshold",
  "psych-general:working-memory": "kp-working-memory",
  "psych-education:reinforcement": "kp-reinforcement",
  "psych-experimental:variables": "kp-experiment-variables",
  "politics-marxism:practice": "kp-marx-practice",
  "politics-marxism:contradiction": "kp-contradiction",
  "politics-history:social-conditions": "kp-modern-history",
};

export function createCoreKnowledgePoints(): BetaKnowledgePoint[] {
  const now = new Date().toISOString();
  const output: BetaKnowledgePoint[] = Object.entries(chapters).flatMap(([chapterId, seeds]) => seeds.map(([id, title, titleEn, coreConcept, explanation, keyPoints, pitfalls], index) => ({
    id: legacyIds[`${chapterId}:${id}`] ?? `system-${chapterId}-${id}`, ownerId: "local-owner", createdAt: now, updatedAt: now,
    subjectId: chapterId.startsWith("psych-") ? "subject-psychology-312" : "subject-politics",
    chapterId, unitId: `unit-${chapterId}-${Math.min(index + 1, chapterId === "psych-general" ? 9 : 7)}`,
    title, titleEn, coreConcept, explanation, keyPoints, pitfalls,
    importance: index === 0 ? 5 : index === 1 ? 4 : 3,
    contentVersion: CORE_CONTENT_VERSION, personalNote: "", mastery: "new" as const, favorite: false,
  })));
  for (const point of output) point.relatedPointIds = output.filter((entry) => entry.chapterId === point.chapterId && entry.id !== point.id).slice(0, 2).map((entry) => entry.id);
  return output;
}

const practice: Record<string, [stem: string, options: string[], answer: number, explanation: string]> = {
  "psych-general": ["关于感觉阈限，哪项表述正确？", ["阈限越低，感受性通常越高", "阈限越低，感受性越低", "所有人的阈限固定不变", "差别阈限与刺激变化无关"], 0, "阈限较低意味着较小刺激即可被觉察，通常对应较高感受性。"],
  "psych-social": ["将某人的一次迟到直接归因于其懒惰，而忽视交通中断，忽略了什么？", ["情境因素", "测量单位", "统计显著性", "视觉恒常性"], 0, "归因需要考虑个人特征和具体情境，不能只看单次行为。"],
  "psych-development": ["研究儿童随年龄变化的同一群体多年，主要属于哪种设计？", ["横断研究", "纵向研究", "单次实验", "个案访谈"], 1, "纵向研究会在多个时间点追踪同一群体。"],
  "psych-education": ["通过移除令人不适的噪声而使某行为增加，这属于？", ["正强化", "负强化", "正惩罚", "消退"], 1, "负强化通过移除厌恶刺激来增加行为发生概率。"],
  "psych-experimental": ["研究学习方法对成绩的影响时，被测量的成绩通常是什么变量？", ["自变量", "因变量", "随机变量", "抽样框"], 1, "学习方法是研究条件，成绩是观察到的结果变量。"],
  "psych-statistics": ["p 值可以直接解释为零假设为真的概率吗？", ["可以", "不可以", "仅当 p<0.05 时可以", "仅当样本很大时可以"], 1, "p 值是在零假设及模型成立时观察到当前或更极端数据的概率。"],
  "psych-measurement": ["某测验重复测量结果稳定，但未测到预期构念。最直接说明什么？", ["信度高必然效度高", "信度与效度应分别评估", "常模一定失效", "无需验证用途"], 1, "稳定性证据不能单独证明分数解释适当。"],
  "politics-marxism": ["分析一个具体社会问题时，把一般原理与当地条件结合，体现了什么？", ["只看普遍性", "普遍性与特殊性相结合", "否定任何一般规律", "只看个别现象"], 1, "一般原理要在具体条件中得到理解和运用。"],
  "politics-theory": ["理解新民主主义革命任务时，首先应放在什么背景下分析？", ["当时社会性质与主要矛盾", "个人偏好", "今日网络热度", "孤立的年代数字"], 0, "历史任务应联系当时社会性质与主要矛盾。"],
  "politics-xi": ["高质量发展与单纯追求增长速度的关系，哪项更恰当？", ["两者完全相同", "高质量发展还关注结构、效益与可持续性", "高质量发展只关注环境", "高质量发展排除经济增长"], 1, "高质量发展强调质量与效益，并兼顾多方面发展。"],
  "politics-history": ["评价辛亥革命的历史作用，哪种方法更合理？", ["只看最终未解决的问题", "同时分析历史贡献与局限", "只背年份", "完全脱离当时条件"], 1, "历史评价要结合时代条件，同时分析变化与未解决的问题。"],
  "politics-ethics": ["以下哪项关于道德与法律的表述更恰当？", ["所有不道德行为必然违法", "二者作用方式不同，也可能相互支持", "法律只评价个人情绪", "道德完全等同于法律"], 1, "道德和法律都是社会规范，但形成和实施方式不同。"],
  "politics-current": ["整理一条时政事件时，应当优先记录什么？", ["未经核实的转述", "事件、日期、可追溯来源和原文链接", "预测考题数量", "只记标题"], 1, "时政学习应先核对事实、日期和原始来源。"],
};

export function createCoreQuestions(): BetaQuestion[] {
  const now = new Date().toISOString();
  return Object.entries(practice).map(([chapterId, [stem, options, answer, explanation]]) => ({
    id: `system-question-${chapterId}-1`, ownerId: "local-owner", createdAt: now, updatedAt: now,
    subjectId: chapterId.startsWith("psych-") ? "subject-psychology-312" : "subject-politics", chapterId,
    knowledgePointId: legacyIds[`${chapterId}:${chapters[chapterId][0][0]}`] ?? `system-${chapterId}-${chapters[chapterId][0][0]}`,
    examType: "system-practice", questionType: "single", stem,
    options: options.map((text, index) => ({ id: String(index), text })), answer: [String(answer)], explanation,
    difficulty: "easy", source: "Personal Learning OS 系统原创练习题", tags: ["系统练习题"],
  }));
}

const writtenPractice: Record<string, [prompt: string, approach: string, keywords: string[], reference: string]> = {
  "psych-general": ["简述绝对感觉阈限与差别阈限的区别。", "分别定义两种阈限，再用一个刺激变化例子比较。", ["觉察", "最小刺激量", "最小差异"], "绝对感觉阈限对应刚能觉察刺激的最小刺激量；差别阈限对应刚能觉察两个刺激之间差异的最小差异量。"],
  "psych-social": ["说明归因时为什么需要同时考虑个体与情境。", "先给出归因含义，再讨论情境约束。", ["内部归因", "外部归因", "情境"], "行为可能受到个人特质与外在情境共同影响；只凭一次行为断定稳定人格容易失真。"],
  "psych-development": ["比较纵向研究与横断研究在发展心理学中的用途。", "从追踪对象、时间和解释限制展开。", ["同一群体", "不同年龄", "时间变化"], "纵向研究追踪同一群体随时间变化；横断研究比较同一时期不同年龄群体。二者都需警惕混淆因素。"],
  "psych-education": ["为什么负强化不等于惩罚？", "按行为结果是否增加来区分。", ["移除厌恶刺激", "行为增加", "惩罚"], "负强化通过移除厌恶刺激提高行为未来出现概率；惩罚旨在降低行为发生概率。"],
  "psych-experimental": ["设计实验时如何识别并控制混淆变量？", "明确操纵条件和测量结果，再列出潜在第三因素。", ["自变量", "因变量", "随机分配", "控制"], "混淆变量同时关联研究条件与结果，会削弱因果解释。可通过随机分配、匹配或标准化程序减少影响。"],
  "psych-statistics": ["解释 p 值的含义，并指出一种常见误解。", "先写条件，再说明不能推出的结论。", ["零假设", "更极端", "条件概率"], "p 值是在零假设与检验模型成立时，得到当前或更极端数据的概率；它不是零假设为真的概率。"],
  "psych-measurement": ["为什么测验有较高信度仍需评估效度？", "分别阐明结果一致性与解释适当性。", ["一致性", "分数解释", "用途"], "信度描述测量结果的一致性；效度关注具体分数解释和用途是否有充分证据。稳定地测错内容仍可能缺乏效度。"],
  "politics-marxism": ["说明分析具体问题时普遍性与特殊性如何结合。", "先区分共性与个性，再说明应用条件。", ["一般原理", "具体条件", "具体分析"], "矛盾具有普遍性，但不同事物与阶段有特殊性；应用一般原理应分析具体条件，不能以抽象共性替代具体研究。"],
  "politics-theory": ["说明分析新民主主义革命任务时为什么要联系历史条件。", "从社会性质、主要矛盾及任务之间的关系作答。", ["社会性质", "主要矛盾", "革命任务"], "革命任务形成于特定历史条件，理解其对象与路径需要联系当时社会性质及主要矛盾。"],
  "politics-xi": ["如何区分高质量发展与单纯追求增长速度？", "按发展结构、效益和可持续性展开。", ["质量", "效益", "可持续"], "高质量发展不仅关注增长规模，还重视结构、效率、创新与生态可持续性。"],
  "politics-history": ["评价辛亥革命时，应怎样同时呈现贡献与局限？", "分别列出制度变化及未完成的社会任务。", ["结束帝制", "共和观念", "历史局限"], "辛亥革命推动了帝制结束和共和观念传播，但没有解决近代中国全部社会问题；评价应结合当时条件。"],
  "politics-ethics": ["比较道德规范与法律规范的作用方式。", "分析形成、实施和后果。", ["社会规范", "强制力", "评价"], "道德与法律均规范社会行为，但形成、实施和制裁方式不同；二者可以相互支持，不应简单等同。"],
  "politics-current": ["如何把一条真实时政事件整理为可复习的学习材料？", "先核验事实，再建立理论关联。", ["来源", "日期", "原文链接", "理论关联"], "记录可追溯来源、事件及发布时间，区分事实和评论；理论关联须说明依据，不能把猜测当作考试重点。"],
};

export function createCoreSubjectiveQuestions(): BetaSubjectiveQuestion[] {
  const now = new Date().toISOString();
  return Object.entries(writtenPractice).map(([chapterId, [prompt, thinking, keywords, referencePoints]]) => ({
    id: `system-written-${chapterId}-1`, ownerId: "local-owner", createdAt: now, updatedAt: now,
    subjectId: chapterId.startsWith("psych-") ? "subject-psychology-312" : "subject-politics",
    chapterId, kind: "short", prompt, thinking, keywords, referencePoints, ownAnswer: "", source: "Personal Learning OS 系统原创练习题",
  }));
}
