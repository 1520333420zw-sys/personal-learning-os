import type { BetaKnowledgePoint, BetaQuestion, BetaSubjectiveQuestion } from "@/domain/beta";
import { createOutlineUnits } from "@/data/browser/learning-outline";

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

const expandedChapters: Record<string, Seed[]> = {
  "psych-general": [
    ["neuron", "神经元与突触传递", "Neurons and synaptic transmission", "神经元通过电化学过程传递信息，突触是神经元之间信息交换的重要部位。", "动作电位沿轴突传播，到达末梢后影响神经递质释放；递质与受体结合后改变突触后细胞活动。", "区分神经冲动在神经元内的传播与突触间的化学传递。", "神经递质不能简单分成永远兴奋或永远抑制，其作用与受体和回路有关。"],
    ["consciousness", "意识与无意识加工", "Conscious and unconscious processing", "意识是个体对内外经验的觉知状态，部分信息加工可在缺乏明确觉知时发生。", "意识研究关注觉醒水平、觉知内容和控制加工；无意识加工的证据需要排除残余觉知与反应偏差。", "比较意识内容、觉醒程度和自动加工。", "没有口头报告不等于一定没有任何意识体验。"],
    ["signal-detection", "信号检测论", "Signal detection theory", "信号检测论把感觉判断分为辨别能力与反应标准两个方面。", "命中、漏报、虚报和正确拒斥共同反映观察者在噪声中判断信号的结果。", "区分感受性指标与判断标准，说明奖惩如何移动标准。", "命中率升高未必表示辨别能力提高，也可能伴随更多虚报。"],
    ["perceptual-organization", "知觉组织原则", "Perceptual organization", "知觉系统会依据接近、相似、连续和闭合等线索组织感觉输入。", "图形与背景的分化使部分区域成为知觉对象，其余区域成为背景。", "用新图形识别组织线索并说明多种线索可能共同作用。", "组织原则描述倾向，不是对所有刺激都无条件成立的定律。"],
    ["long-term-memory", "长时记忆系统", "Long-term memory systems", "长时记忆包含可有意识提取的陈述性记忆和通过表现体现的非陈述性记忆。", "情景记忆涉及个人事件，语义记忆涉及一般知识；程序性技能常通过练习和操作表现。", "比较情景、语义和程序性记忆的内容与测量方式。", "不能把记不清事件细节等同于所有长期保存都消失。"],
    ["forgetting", "遗忘与提取失败", "Forgetting and retrieval failure", "遗忘可能来自编码不足、痕迹变化、干扰或提取线索不充分。", "前摄干扰是旧信息妨碍新信息，倒摄干扰是新信息妨碍旧信息；合适线索可改善提取。", "结合实验条件判断编码、存储和提取环节。", "提取失败不等于记忆内容已经永久删除。"],
    ["problem-solving", "问题解决", "Problem solving", "问题解决是从初始状态通过一系列操作达到目标状态的认知活动。", "算法能系统搜索，启发式降低搜索成本；功能固着和思维定势可能限制方案。", "识别问题表征、策略选择和结果检验三个环节。", "启发式提高效率但不保证每次得到正确答案。"],
    ["motivation", "动机与目标", "Motivation and goals", "动机激发并维持指向目标的行为，同时受需要、期待和价值判断影响。", "内在动机来自活动本身的兴趣或满足，外在动机与外部结果相联系，两者可共同存在。", "从方向、强度和持续性分析动机。", "外部奖励不必然削弱内在动机，效果取决于控制感和反馈含义。"],
    ["emotion", "情绪的成分与调节", "Emotion and regulation", "情绪包含主观体验、生理唤醒、认知评价和表达行为等相互联系的成分。", "情绪调节可以发生在情境选择、注意分配、认知改变或反应调整等阶段。", "比较认知重评与表达抑制的作用时点。", "调节情绪不等于压抑或消除一切负性体验。"],
    ["personality-traits", "人格特质", "Personality traits", "人格特质描述个体在多种情境中相对稳定的思维、情绪和行为倾向。", "特质模型用于概括个体差异，但具体行为仍受到情境、角色与发展阶段影响。", "区分特质水平描述与单次行为判断。", "特质分数不是固定命运，也不能替代对情境的分析。"],
  ],
  "psych-social": [
    ["socialization", "社会化", "Socialization", "社会化是个体学习社会规范、角色与文化意义并形成社会能力的过程。", "家庭、同伴、学校、媒体和制度环境都可能成为社会化来源，影响在生命全程持续发生。", "比较早期社会化与成人角色再社会化。", "社会化不是个体被动接受，个体也会选择和重构经验。"],
    ["self-concept", "自我概念与自尊", "Self-concept and self-esteem", "自我概念是个体对自身属性和角色的认知组织，自尊涉及对自我的评价。", "自我知识来自反思、社会比较和他人反馈，并随情境突出不同部分。", "区分描述性的自我概念与评价性的自尊。", "高自尊不等于在所有领域都准确评价自己。"],
    ["cognitive-dissonance", "认知失调", "Cognitive dissonance", "认知失调是相互不一致的认知或行为造成的心理紧张。", "个体可能通过改变行为、调整态度或增加解释来降低失调。", "识别自由选择、努力合理化和不充分理由等情境。", "态度改变不是失调降低的唯一方式。"],
    ["obedience", "服从", "Obedience", "服从是个体在权威要求下实施行为的社会影响形式。", "责任转移、权威合法性、情境距离与同伴行为会影响服从。", "区分服从、从众和一般顺从请求。", "经典实验结果不能被理解为所有人在任何权威下都会服从。"],
    ["prejudice", "刻板印象、偏见与歧视", "Stereotypes, prejudice and discrimination", "刻板印象是群体认知表征，偏见是评价态度，歧视是行为上的差别对待。", "三者相互影响但并不等同，群际分类、竞争与社会规范可参与形成。", "在案例中分别识别认知、情感和行为层面。", "承认群体差异不自动构成偏见，关键要看证据与评价方式。"],
    ["prosocial", "亲社会行为", "Prosocial behavior", "亲社会行为旨在使他人或群体受益，其动机可以包含同情、规范与互惠期待。", "旁观者人数、责任分散、情境清晰度和助人能力会影响介入。", "区分行为结果与行为者动机。", "旁观者多并不必然导致无人帮助，情境和沟通可改变责任判断。"],
  ],
  "psych-development": [
    ["research-design", "发展研究设计", "Developmental research designs", "发展研究通过横断、纵向和序列设计描述年龄相关变化。", "横断设计高效但易受群体差异影响；纵向设计能追踪个体但面临流失和重复测量效应。", "根据研究问题比较时间、样本和因果限制。", "年龄组差异不能直接等同于个体随年龄发生的变化。"],
    ["prenatal", "产前发展", "Prenatal development", "产前发展经历有序的生理形成过程，同时受到遗传与环境条件共同影响。", "不同器官具有敏感期，影响的结果与暴露时间、剂量和个体条件有关。", "用概率和条件解释风险因素，而非作绝对预测。", "存在风险因素不意味着个体必然出现发展问题。"],
    ["piaget", "皮亚杰认知发展理论", "Piaget's theory", "皮亚杰用图式、同化和平衡化解释儿童主动建构认知结构的过程。", "阶段理论强调思维结构的质变，后续研究也表明任务经验和领域知识会影响表现。", "理解阶段特征，同时说明经典任务的条件限制。", "儿童在某任务失败不表示其所有相关能力都完全不存在。"],
    ["language-development", "语言发展", "Language development", "语言发展涉及语音、词汇、句法和语用能力在社会互动中的协调变化。", "生物准备、统计学习、共同注意和成人回应都为语言获得提供条件。", "区分理解性语言与表达性语言。", "词汇量增长不能单独代表全部语言能力。"],
    ["moral-development", "道德发展", "Moral development", "道德发展包括对规则、公平、关怀和责任的理解以及相应行为调节。", "道德判断会受认知能力、情绪体验、关系和文化情境共同影响。", "区分道德推理水平与真实情境中的道德行为。", "会陈述高水平理由不保证在压力下必然采取相同行为。"],
    ["aging", "成年晚期与老化", "Later adulthood and aging", "老化表现出多方向变化，不同认知、情绪和社会功能的轨迹并不相同。", "加工速度和部分流体能力可能下降，知识经验与情绪调节可保持或发展。", "关注个体差异、选择性优化和补偿。", "不能把正常老化与疾病性衰退混为一谈。"],
  ],
  "psych-education": [
    ["classical-conditioning", "经典条件作用", "Classical conditioning", "经典条件作用通过刺激之间的联系使原本中性的刺激获得引发反应的能力。", "习得、消退、恢复、泛化和分化描述条件反应在不同阶段的变化。", "区分无条件刺激、条件刺激及其对应反应。", "消退通常是新学习，不等于原有联系被彻底抹除。"],
    ["observational-learning", "观察学习", "Observational learning", "观察学习通过注意、保持、动作再现和动机过程从他人行为中获得信息。", "榜样行为是否被模仿还取决于榜样后果、学习者能力和目标。", "区分学会某行为与实际表现该行为。", "没有立即模仿不表示没有发生学习。"],
    ["learning-motivation", "学习动机", "Learning motivation", "学习动机影响学习者选择任务、投入努力和面对困难时的坚持。", "目标定向、自我效能、任务价值和归因方式共同影响学习行为。", "把动机诊断落实到可改变的任务与反馈设计。", "不能把低表现简单解释为缺乏意志。"],
    ["knowledge-learning", "陈述性知识学习", "Declarative knowledge learning", "陈述性知识学习需要把新信息与已有知识组织并建立可提取联系。", "精加工、组织、生成解释和间隔提取通常比机械重复更有助于长期保持。", "比较识记、理解和迁移三个层次。", "看起来熟悉不等于能够独立回忆和应用。"],
    ["problem-solving-education", "问题解决与迁移", "Problem solving and transfer", "教育情境中的问题解决要求识别问题结构、调用策略并监控结果。", "通过变式练习和比较案例可以突出深层结构，促进跨情境迁移。", "让学习者说明为什么选择某一步。", "只练完全相同题型容易形成表面匹配。"],
    ["instructional-design", "教学目标与设计", "Instructional design", "教学设计把学习目标、活动、评价和反馈组织成一致的学习过程。", "目标应描述可观察的学习结果，评价需与目标和练习机会匹配。", "检查目标、教学和评价三者的一致性。", "活动丰富不等于真正服务于学习目标。"],
  ],
  "psych-experimental": [
    ["operational-definition", "操作定义", "Operational definition", "操作定义把抽象构念转化为可操纵或可测量的程序。", "同一构念可有不同操作化方式，因此结论的外推范围取决于操作与理论的匹配。", "说明测量指标如何代表构念。", "操作方便不表示构念效度自然成立。"],
    ["within-between", "组间与组内设计", "Between- and within-subjects designs", "组间设计让不同参与者接受不同条件，组内设计让同一参与者接受多个条件。", "组内设计控制个体差异但需要处理顺序和携带效应；组间设计需关注组间可比性。", "根据研究问题选择设计并说明控制措施。", "不能只按样本量大小判断设计优劣。"],
    ["counterbalancing", "顺序效应与抵消", "Order effects and counterbalancing", "顺序效应是条件先后影响后续表现，抵消法通过安排不同顺序降低系统偏差。", "完全抵消、拉丁方和随机化适合不同条件数量与资源限制。", "区分练习效应、疲劳效应和携带效应。", "随机呈现不保证小样本中每种顺序完全均衡。"],
    ["psychophysics", "心理物理法", "Psychophysical methods", "心理物理法研究物理刺激量与感觉判断之间的关系。", "最小变化法、恒定刺激法和平均差误法在刺激呈现及阈限估计上各有特点。", "比较三种方法的程序、误差与效率。", "测得阈限会受判断标准、适应和程序顺序影响。"],
    ["attention-experiment", "注意实验范式", "Attention paradigms", "注意实验通过线索、干扰和双任务条件推断选择与资源分配过程。", "结果解释要同时观察反应时和正确率，并控制刺激显著性和任务策略。", "联系范式操作与理论问题。", "单一反应时差异不能唯一确定某个内部加工阶段。"],
    ["memory-experiment", "记忆实验范式", "Memory paradigms", "记忆实验通过学习、保持和测验阶段操纵编码或提取条件。", "自由回忆、线索回忆和再认对提取要求不同，成绩还受材料与策略影响。", "区分过程测量与最终正确率。", "再认高于回忆不表示再认完全不需要记忆搜索。"],
  ],
  "psych-statistics": [
    ["mean-median", "均值、中位数与众数", "Mean, median and mode", "集中量用不同方式描述一组数据的典型位置。", "均值利用全部数值但受极端值影响，中位数依赖排序位置，众数反映最常见取值。", "依据测量尺度和分布形态选择指标。", "平均数不能在所有情境中代表典型个体。"],
    ["variance", "方差", "Variance", "方差是各观测值对均值离差平方的平均，用于描述离散程度。", "平方消除正负离差抵消，并使较大偏离具有更大权重；样本方差常使用自由度校正。", "理解方差与标准差在单位上的区别。", "方差不能与原变量数值直接按同一单位比较。"],
    ["correlation", "相关系数", "Correlation coefficient", "相关系数概括两个变量线性关系的方向与强度。", "其数值受到离群值、取值范围和关系形态影响，相关不提供充分的因果证据。", "先查看散点图，再解释相关系数。", "相关为零不表示两个变量之间不存在任何非线性关系。"],
    ["sampling-distribution", "抽样分布与标准误", "Sampling distributions and standard errors", "抽样分布描述统计量在重复抽样中的变化，标准误衡量这种抽样波动。", "样本量增大通常使均值标准误减小，但不能消除系统性抽样偏差。", "区分样本标准差与统计量标准误。", "标准误小不意味着原始个体差异小。"],
    ["hypothesis-testing", "假设检验逻辑", "Hypothesis testing", "假设检验在零假设和模型前提下评估样本结果与其相容程度。", "显著性水平、检验统计量和 p 值共同服务于决策，同时需报告效应量和不确定性。", "区分第一类错误、第二类错误与统计功效。", "未拒绝零假设不等于已经证明零假设正确。"],
    ["t-test", "t 检验", "T tests", "t 检验用于在估计标准误的条件下比较均值差异。", "独立样本、配对样本和单样本 t 检验对应不同数据结构与研究问题。", "先确认独立性、配对关系和方差条件。", "不能把同一批参与者的前后测当作独立样本处理。"],
    ["anova", "方差分析", "Analysis of variance", "方差分析通过比较组间变异与组内变异检验多个均值是否存在总体差异。", "显著总体检验只说明至少一组不同，具体差异需结合计划比较或多重比较。", "理解主效应、交互作用和误差项。", "总体显著不能直接说明每两组之间都显著。"],
    ["regression", "线性回归", "Linear regression", "线性回归用一个或多个预测变量描述结果变量的条件均值。", "系数表示其他模型条件不变时预测变量变化与结果变化的关系，解释依赖模型假设与研究设计。", "检查残差、异常值和多重共线性。", "回归系数显著不自动证明预测变量造成结果变化。"],
  ],
  "psych-measurement": [
    ["classical-test-theory", "经典测验理论", "Classical test theory", "经典测验理论把观察分数表示为真分数与测量误差之和。", "真分数是重复独立测量的期望概念，误差在模型中具有特定统计假设。", "用误差来源解释信度和分数波动。", "真分数不是可直接观察到的固定答题分数。"],
    ["item-difficulty", "项目难度", "Item difficulty", "项目难度描述特定样本在题目上的作答水平，客观题常用通过率表示。", "通过率越高通常表示题目越容易，指标会随被试群体而变化。", "结合目标群体和测验用途解释难度。", "项目难度不是题目固有且永远不变的属性。"],
    ["item-discrimination", "项目区分度", "Item discrimination", "项目区分度反映题目区分不同总体测验表现者的能力。", "可比较高低分组通过率或使用项目与总分的相关，但需防止项目本身重复计入造成膨胀。", "同时检查题目内容和统计指标。", "区分度低不一定只由题目太难造成。"],
    ["standard-scores", "标准分数", "Standard scores", "标准分数把原始分数转换为相对于参照分布的位置。", "z 分数以均值为零、标准差为一表示相对距离，其他标准分可由线性转换得到。", "根据常模群体解释相对位置。", "标准分变化不表示受测者能力一定发生真实变化。"],
    ["test-development", "测验编制流程", "Test development", "测验编制从明确用途与内容范围开始，经过命题、试测、项目分析和效度证据积累。", "评分、常模、使用说明和公平性审查也是测验质量的重要部分。", "把每一步与预期分数解释连接起来。", "项目数量多不自动保证测验有效。"],
    ["intelligence-tests", "智力测验的解释", "Interpreting intelligence tests", "智力测验用标准化任务对某些认知表现进行取样和比较。", "解释分数应考虑常模、测量误差、语言文化经验以及具体用途。", "结合置信区间和分测验模式谨慎解释。", "单个总分不能概括个体全部能力与发展潜力。"],
  ],
  "politics-marxism": [
    ["materialism", "物质与意识", "Matter and consciousness", "辩证唯物主义强调物质的客观实在性，同时承认意识具有能动作用。", "意识的内容来源于客观世界，其能动作用需要通过实践并受客观条件制约。", "说明物质决定性与意识能动性的统一。", "既不能夸大主观意志，也不能否认人的主动实践。"],
    ["dialectics", "联系与发展", "Connection and development", "世界上的事物处在普遍联系和变化发展之中。", "联系具有客观性、普遍性和多样性，发展体现新事物产生和旧事物消亡的过程。", "用条件性和系统观点分析具体联系。", "不能把任何两个同时出现的现象都认定为本质联系。"],
    ["quantity-quality", "量变与质变", "Quantitative and qualitative change", "量变是事物数量和程度的渐进变化，质变是根本性质的变化。", "量的积累在一定条件下引起质变，质变又为新的量变开辟条件。", "结合度、关节点和条件说明转化。", "量变并非在任何情况下都会自动导向预期质变。"],
    ["truth", "真理及其检验", "Truth and its test", "真理是对客观事物及其规律的正确反映，具有客观性、具体性和条件性。", "实践是检验真理的重要标准，认识也在新的实践中不断修正和发展。", "区分真理的绝对性与相对性。", "真理的条件性不等于所有观点都同样正确。"],
    ["labor-value", "劳动价值论基础", "Foundations of the labor theory of value", "商品具有使用价值和价值两个因素，生产商品的劳动具有具体劳动和抽象劳动两重性。", "社会必要劳动时间与商品价值量相关，劳动生产率变化会影响单位商品价值量。", "把商品二因素与劳动二重性对应起来。", "使用价值大小不能直接决定商品价值量。"],
  ],
  "politics-theory": [
    ["mao-thought", "毛泽东思想的形成与发展", "Formation of Mao Zedong Thought", "毛泽东思想是在中国革命和建设实践中形成发展的理论成果。", "学习其形成要联系历史条件、实践问题和理论探索，区分不同发展阶段。", "按时间线梳理问题、实践与理论成果。", "不能把后来的概念和表述无条件投射到早期阶段。"],
    ["revolution-road", "新民主主义革命道路", "Path of the new democratic revolution", "革命道路的形成与近代中国社会结构和革命力量分布密切相关。", "理解道路选择需要联系城乡关系、群众基础和长期实践探索。", "从国情与实践条件解释道路，而非只记结论。", "不能脱离历史条件机械套用其他国家经验。"],
    ["socialist-construction", "社会主义建设道路探索", "Exploration of socialist construction", "社会主义建设道路探索围绕工业化、经济关系和社会发展展开。", "需要同时认识探索成果、曲折经验和历史条件，形成阶段性评价。", "用问题导向梳理政策目标与实践结果。", "不能以单一事件概括整个探索时期。"],
    ["market-economy", "社会主义市场经济", "Socialist market economy", "社会主义市场经济把社会主义基本制度与市场机制结合起来。", "市场在资源配置中发挥作用，同时需要更好发挥政府作用并维护公共利益。", "区分市场机制、宏观调控和制度目标。", "不能把市场机制简单等同于某一种社会制度。"],
  ],
  "politics-xi": [
    ["people-centered", "坚持以人民为中心", "People-centered development", "以人民为中心强调发展的出发点、过程和成果与人民需要相联系。", "学习时应区分价值立场、发展目标和具体政策工具。", "从民生、公共服务和共同发展等维度理解。", "不能把价值原则简化为单一短期指标。"],
    ["new-development", "新发展理念", "New development philosophy", "创新、协调、绿色、开放、共享构成相互联系的发展理念。", "各理念针对发展中的不同矛盾，又需要在整体发展中协同落实。", "说明每项理念解决的主要问题及相互关系。", "不能把五个方面割裂为互不相关的政策口号。"],
    ["rule-of-law", "全面依法治国", "Law-based governance", "全面依法治国强调在法治轨道上推进国家治理。", "学习框架包括科学立法、严格执法、公正司法和全民守法等相互联系环节。", "区分法治目标、制度建设和实施环节。", "依法治理不能被简化为增加惩罚强度。"],
    ["security", "总体国家安全观", "Holistic approach to national security", "总体国家安全观以系统思维理解多领域安全之间的联系。", "风险治理需要统筹发展和安全，并识别不同领域风险的传导与边界。", "用系统关系分析安全议题。", "不能把安全理解为单一领域或孤立事件。"],
  ],
  "politics-history": [
    ["opium-war", "鸦片战争与近代开端", "The Opium War and modern transformation", "鸦片战争后中国社会关系和外部环境发生深刻变化。", "学习应联系条约体系、社会结构变化以及民族危机加深，而非只记战役过程。", "从背景、过程、结果和影响建立时间线。", "不能用单一军事失败解释全部社会变化。"],
    ["may-fourth", "五四运动", "May Fourth Movement", "五四运动推动了反帝反封建斗争和新的思想传播。", "理解其历史意义需联系群众参与、先进思想传播及中国革命阶段变化。", "区分事件起因、运动过程和长期影响。", "不能把思想文化活动与政治运动简单混为同一概念。"],
    ["party-founding", "中国共产党成立的历史条件", "Historical conditions of the CPC's founding", "中国共产党的成立具有近代社会矛盾、工人运动发展和思想传播等多重条件。", "分析时应把阶级基础、思想基础和组织活动联系起来。", "用因果链而非孤立日期说明历史条件。", "成立日期本身不能替代对历史必然性与具体过程的解释。"],
    ["resistance", "全民族抗战", "War of Resistance", "全民族抗战是在民族危机加深背景下形成的广泛抗战格局。", "应理解正面战场、敌后战场和社会动员的作用及其相互关系。", "从统一战线和持久抗战角度组织知识。", "不能用单一战场替代对整个抗战格局的分析。"],
  ],
  "politics-ethics": [
    ["ideal-belief", "理想与信念", "Ideals and convictions", "理想指向未来目标，信念体现对一定认识和价值的稳定确信。", "理想信念通过实践选择和持续行动发挥作用，也需要在现实条件中检验和发展。", "区分理想、信念与一般愿望。", "远大目标不能代替具体可执行的行动。"],
    ["public-morality", "公共生活中的道德规范", "Morality in public life", "公共道德调节共同生活中的基本行为关系。", "文明礼貌、助人为乐、爱护公物、保护环境和遵纪守法等要求需要落实到具体情境。", "分析行为对他人和公共秩序的影响。", "公共道德不只适用于线下熟人社会。"],
    ["legal-rights", "法律权利的行使", "Exercise of legal rights", "法律权利的行使具有主体、范围、程序和边界条件。", "依法行使权利需要尊重他人合法权益和公共利益，并按法定程序主张。", "从权利内容、行使方式和救济途径分析案例。", "拥有权利不意味着可以采用任何方式实现诉求。"],
    ["legal-duties", "法律义务与责任", "Legal duties and responsibility", "法律义务是法律规定主体应当作为或不作为的要求。", "违反义务可能产生相应法律责任，责任类型与构成条件需要依据具体法律判断。", "区分义务内容、违法事实和责任承担。", "道德批评不能直接替代法律责任认定。"],
  ],
  "politics-current": [
    ["official-source", "权威来源分级", "Authoritative source hierarchy", "时政资料应优先使用可核验的官方原文和权威发布渠道。", "转载和评论可以辅助理解，但需保留原始发布日期、发布机构和链接，明确事实与观点。", "建立来源等级并记录抓取或阅读时间。", "来源名称看似正式不表示内容必然是官方原文。"],
    ["policy-reading", "政策文本阅读", "Reading policy documents", "政策文本阅读需要先识别发布主体、适用范围、时间效力和核心任务。", "标题和摘要不能替代正文，重要表述应回到原文上下文核对。", "按背景、目标、措施和落实机制整理。", "不能把媒体概括直接当作政策原文引用。"],
    ["current-affair-review", "时政复习卡片", "Current-affairs review cards", "时政复习卡片应以已核验事件为基础，压缩为事实、背景、关联理论和不确定性。", "卡片需要保留原文链接与发布日期，后续进展发生时更新而不是覆盖历史记录。", "先核验事实，再建立理论关联和练习问题。", "系统重点或 AI 判断不能冒充真题高频。"],
  ],
};

const chapterStudyLens: Record<string, [string, string, string]> = {
  "psych-general": ["基本现象及其发生条件", "加工过程、功能与相互影响", "研究证据、生活表现与适用边界"],
  "psych-social": ["个体与社会情境的共同作用", "认知、情感和行为之间的联系", "群体差异、研究情境与解释边界"],
  "psych-development": ["随年龄变化的主要表现", "成熟、经验和文化的共同影响", "研究设计、个体差异与发展可塑性"],
  "psych-education": ["学习目标与行为表现", "学习者、任务和反馈之间的作用", "迁移条件、教学应用与评价证据"],
  "psych-experimental": ["研究问题与可观察指标", "操纵、控制和测量的逻辑", "替代解释、误差来源与结论边界"],
  "psych-statistics": ["统计量的定义与数据条件", "计算结果所表达的信息", "模型假设、不确定性与正确解释"],
  "psych-measurement": ["测量目的、对象和分数含义", "误差控制与证据积累", "适用群体、使用情境与解释限制"],
  "politics-marxism": ["基本概念与理论关系", "原理展开的逻辑层次", "联系实际时必须说明的条件"],
  "politics-theory": ["理论形成的历史问题", "主要内容及内在联系", "历史条件、实践发展与评价边界"],
  "politics-xi": ["稳定理论框架与价值立场", "总体布局中的相互关系", "具体表述须以当前权威原文为准"],
  "politics-history": ["事件发生的社会历史条件", "过程、力量和阶段关系", "历史作用、局限与证据来源"],
  "politics-ethics": ["概念、规范和适用主体", "价值要求与行为选择", "道德评价和法律判断的不同边界"],
  "politics-current": ["事实、时间和权威来源", "事件背景与稳定理论的关联", "后续更新、不确定性与核验责任"],
};

function createOutlineSeeds(): Record<string, Seed[]> {
  const output: Record<string, Seed[]> = {};
  for (const unit of createOutlineUnits()) {
    const lens = chapterStudyLens[unit.chapterId];
    const axes: [string, string][] = [
      ["概念框架", lens[0]], ["关键关系", lens[1]], ["证据与应用", lens[2]],
    ];
    if (unit.subjectId === "subject-politics" && unit.order === 1) axes.push(["复习表达", `用准确概念组织${unit.title}的简答与分析题表述`]);
    output[unit.chapterId] ??= [];
    axes.forEach(([axis, focus], index) => output[unit.chapterId].push([
      `outline-${unit.order}-${index + 1}`, `${unit.title}：${axis}`, `${unit.titleEn}: ${axis}`,
      `${unit.title}的${axis}用于把“${focus}”组织成可理解、可复述的知识结构。`,
      `学习这一部分时，先界定${unit.title}讨论的对象，再按“${focus}”梳理层次，并用相邻概念或具体材料检查理解。`,
      `能够不看提示说明${unit.title}中的${focus}，并指出它与同章其他内容的联系。`,
      `不要只记“${unit.title}”这一目录名称，也不要脱离前提把局部结论扩大到所有情境。`,
    ]));
  }
  return output;
}

const outlineSeeds = createOutlineSeeds();
const contentChapters = Object.fromEntries(Object.entries(chapters).map(([id, seeds]) => [id, [...seeds, ...(expandedChapters[id] ?? []), ...(outlineSeeds[id] ?? [])]]));

export const CORE_CONTENT_VERSION = "2026.10-core-3";
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
  const output: BetaKnowledgePoint[] = Object.entries(contentChapters).flatMap(([chapterId, seeds]) => seeds.map(([id, title, titleEn, coreConcept, explanation, keyPoints, pitfalls], index) => ({
    id: legacyIds[`${chapterId}:${id}`] ?? `system-${chapterId}-${id}`, ownerId: "local-owner", createdAt: now, updatedAt: now,
    subjectId: chapterId.startsWith("psych-") ? "subject-psychology-312" : "subject-politics",
    chapterId, unitId: `unit-${chapterId}-${Math.min(index + 1, chapterId === "psych-general" ? 9 : 7)}`,
    title, titleEn, coreConcept, explanation, keyPoints, pitfalls, summary: coreConcept, definition: coreConcept,
    coreConcepts: [coreConcept], details: [explanation], commonMistakes: [pitfalls], examFocus: [keyPoints],
    memoryVersion: `${coreConcept}\n${keyPoints}`, tags: [title, chapterId], difficulty: index < 3 ? "introductory" as const : "intermediate" as const,
    sourceType: "system" as const, sourceNote: "Personal Learning OS 原创归纳；不是官方教材或真题统计。", contentPackVersion: CORE_CONTENT_VERSION,
    importance: index === 0 ? 5 : index === 1 ? 4 : 3,
    contentVersion: CORE_CONTENT_VERSION, personalNote: "", mastery: "new" as const, favorite: false,
  })));
  for (const point of output) {
    const siblings = output.filter((entry) => entry.chapterId === point.chapterId);
    const index = siblings.findIndex((entry) => entry.id === point.id);
    point.prerequisiteIds = index > 0 ? [siblings[index - 1].id] : [];
    point.relatedPointIds = siblings.filter((entry) => entry.id !== point.id).slice(Math.max(0, index - 1), Math.max(0, index - 1) + 2).map((entry) => entry.id);
  }
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
  const chapterQuestions: BetaQuestion[] = Object.entries(practice).map(([chapterId, [stem, options, answer, explanation]]) => ({
    id: `system-question-${chapterId}-1`, ownerId: "local-owner", createdAt: now, updatedAt: now,
    subjectId: chapterId.startsWith("psych-") ? "subject-psychology-312" : "subject-politics", chapterId,
    knowledgePointId: legacyIds[`${chapterId}:${contentChapters[chapterId][0][0]}`] ?? `system-${chapterId}-${contentChapters[chapterId][0][0]}`,
    examType: "system-practice", questionType: "single" as const, stem,
    options: options.map((text, index) => ({ id: String(index), text })), answer: [String(answer)], explanation,
    difficulty: "easy", source: "Personal Learning OS 系统原创练习题", sourceType:"system" as const,sourceLabel:"系统练习",isOfficial:false,tags: ["系统练习题"],
  }));
  const points=createCoreKnowledgePoints();const pointQuestions: BetaQuestion[] = points.map((point)=>{const siblings=points.filter((item)=>item.chapterId===point.chapterId&&item.id!==point.id);const distractor=siblings[0]?.coreConcept??"该概念只适用于所有情境且没有边界条件。";return{id:`system-question-${point.id}`,ownerId:"local-owner",createdAt:now,updatedAt:now,subjectId:point.subjectId,chapterId:point.chapterId,knowledgePointId:point.id,examType:"system-practice",questionType:"single" as const,stem:`关于“${point.title}”，下列哪项表述更准确？`,options:[{id:"0",text:point.coreConcept},{id:"1",text:point.pitfalls},{id:"2",text:distractor},{id:"3",text:"仅凭术语名称即可确定所有具体结论。"}],answer:["0"],explanation:`${point.explanation??point.coreConcept} 需要同时注意：${point.pitfalls}`,difficulty: point.importance === 5 ? "medium" : "easy",source:"Personal Learning OS 系统原创练习题",sourceType:"system" as const,sourceLabel:"系统练习",isOfficial:false,tags:["系统练习题",point.title]};});
  const extraLimits: Record<string, number> = { "subject-psychology-312": 80, "subject-politics": 41 };
  const supplemental = Object.entries(extraLimits).flatMap(([subjectId, limit]) => points.filter((point) => point.subjectId === subjectId).slice(0, limit).map((point) => ({
    id:`system-question-${point.id}-boundary`,ownerId:"local-owner",createdAt:now,updatedAt:now,subjectId:point.subjectId,chapterId:point.chapterId,knowledgePointId:point.id,
    examType:"system-practice",questionType:"true_false" as const,stem:`判断：${point.pitfalls}`,options:[{id:"true",text:"正确"},{id:"false",text:"错误"}],answer:["false"],
    explanation:`该表述是常见误区。更准确的理解是：${point.coreConcept} ${point.keyPoints}`,
    difficulty:"medium" as const,source:"Personal Learning OS 系统原创练习题",sourceType:"system" as const,sourceLabel:"系统练习",isOfficial:false,tags:["系统练习题",point.title,"辨析"],
  })));
  return [...chapterQuestions,...pointQuestions,...supplemental];
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
  const authored: BetaSubjectiveQuestion[] = Object.entries(writtenPractice).map(([chapterId, [prompt, thinking, keywords, referencePoints]]) => ({
    id: `system-written-${chapterId}-1`, ownerId: "local-owner", createdAt: now, updatedAt: now,
    subjectId: chapterId.startsWith("psych-") ? "subject-psychology-312" : "subject-politics",
    chapterId, kind: "short" as const, prompt, thinking, keywords, referencePoints, ownAnswer: "", source: "Personal Learning OS 系统原创练习题",
  }));
  const points=createCoreKnowledgePoints();
  const counts:Record<string,number>={"subject-psychology-312":93,"subject-politics":74};
  const generated=Object.entries(counts).flatMap(([subjectId,count])=>points.filter((point)=>point.subjectId===subjectId).slice(0,count).map((point,index)=>({
    id:`system-written-${point.id}`,ownerId:"local-owner",createdAt:now,updatedAt:now,subjectId:point.subjectId,chapterId:point.chapterId,kind:(index%4===3?"essay":"short") as "short"|"essay",
    prompt:index%4===0?`界定“${point.title}”并说明其核心内容。`:index%4===1?`比较“${point.title}”与相关概念，指出主要区别。`:index%4===2?`结合一个适当情境分析“${point.title}”。`:`围绕“${point.title}”组织一段结构完整的论述。`,
    thinking:`先写概念边界，再展开${point.keyPoints}，最后说明${point.pitfalls}`,
    keywords:[point.title,...(point.tags??[]).filter((tag)=>tag!==point.title).slice(0,2)],referencePoints:`${point.coreConcept}\n${point.explanation??""}\n重点：${point.keyPoints}\n辨析：${point.pitfalls}`,
    ownAnswer:"",source:"Personal Learning OS 系统原创练习题",
  })));
  return [...authored,...generated];
}
