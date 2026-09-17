import type { BetaChapter, BetaKnowledgePoint, BetaQuestion, BetaSubject } from "@/domain/beta";

type Topic = [title: string, english: string, concept: string, explanation: string, key: string, pitfall: string];
type Path = { slug: string; name: string; en: string; area: string; areaEn: string; mode: string; blocks: [string, string, string][]; topics: Topic[]; quiz: [string, string[], number, string] };

// Versioned, authored introductory paths. They are not a claim of complete university curricula.
const paths: Path[] = [
  { slug: "mathematics", name: "数学", en: "Mathematics", area: "微积分基础", areaEn: "Calculus foundations", mode: "derivation", blocks: [["formula", "公式", "导数定义：f′(x)=lim(h→0)[f(x+h)−f(x)]/h（极限存在时）。"], ["worked", "分步例题", "对 f(x)=x²，展开 (x+h)²−x²=2xh+h²，除以 h 后令 h→0，得到 f′(x)=2x。"]], topics: [
    ["函数与定义域", "Functions and domains", "函数把定义域中每个输入对应到唯一输出。", "先确认允许的输入，再分析函数值与图像。", "分母不能为零；实数范围内偶次根号内不能为负。", "定义域不是值域。"],
    ["极限", "Limits", "极限描述自变量趋近某处时函数值的趋近趋势。", "极限关注附近行为，不要求函数在该点有定义。", "左右极限都存在且相等才有双侧极限。", "函数在点上的值不能代替极限。"],
    ["导数", "Derivatives", "导数是函数在一点的瞬时变化率，定义为差商的极限。", "几何上可解释为切线斜率；物理上可解释为瞬时速度。", "从定义出发理解求导规则的适用条件。", "不可导点可能连续，但尖点处通常不可导。"],
    ["定积分", "Definite integrals", "定积分是区间上累积量的极限。", "黎曼和将区间分割后求和；在适当条件下可用微积分基本定理计算。", "注意积分上下限与符号。", "定积分可为负，不总是几何面积。"],
  ], quiz: ["函数 f(x)=1/(x−2) 在实数范围内的定义域排除哪个值？", ["0", "1", "2", "所有正数"], 2, "分母 x−2 不得为零，所以 x=2 被排除。"] },
  { slug: "physics", name: "物理", en: "Physics", area: "经典力学", areaEn: "Classical mechanics", mode: "law", blocks: [["law", "定律", "牛顿第二定律：在惯性参考系中，合外力等于动量变化率；质量不变时 F合=ma。"], ["condition", "适用条件", "明确物体、参考系和受力，先画受力图，再在选定方向列方程。"]], topics: [
    ["位移与速度", "Displacement and velocity", "位移是位置变化的矢量；速度描述位移随时间的变化。", "平均速度用总位移除以总时间，瞬时速度由极限定义。", "区分速度与速率。", "往返原点时总路程可非零，但位移为零。"],
    ["加速度", "Acceleration", "加速度是速度变化率。", "方向由速度矢量的变化决定，不一定与运动方向一致。", "在匀加速模型中识别初速度与时间区间。", "速度为零的瞬间，加速度不一定为零。"],
    ["牛顿第二定律", "Newton's second law", "合外力决定物体的加速度。", "质量恒定且在惯性系中，可写作 F合=ma。", "画受力图后按坐标方向分解合力。", "不能把某一个力直接当作合力。"],
    ["功与动能", "Work and kinetic energy", "合外力做功等于动能变化。", "恒力做功可用 W=Fs cosθ，力和位移的夹角决定功的正负。", "先确定系统和位移方向。", "有力作用不代表一定做功。"],
  ], quiz: ["质量 2 kg 的物体所受合外力为 6 N，其加速度大小是？", ["2 m/s²", "3 m/s²", "6 m/s²", "12 m/s²"], 1, "质量不变时 a=F合/m=6/2=3 m/s²。"] },
  { slug: "chemistry", name: "化学", en: "Chemistry", area: "物质与反应", areaEn: "Matter and reactions", mode: "reaction", blocks: [["equation", "方程式", "示例：2H₂ + O₂ → 2H₂O。配平遵循反应前后各元素原子数守恒。"], ["condition", "条件", "反应能否发生以及速率受温度、浓度、催化剂等具体条件影响。"]], topics: [
    ["原子与元素", "Atoms and elements", "元素由具有相同质子数的原子组成。", "同位素质子数相同、中子数不同。", "用质子数确定元素。", "质量数不同不意味着元素不同。"],
    ["化学计量", "Stoichiometry", "配平方程式中的系数给出反应物和生成物的物质的量比例。", "先配平，再根据摩尔比计算，最后检查限制反应物。", "区分系数与化学式下标。", "不能随意修改下标来配平。"],
    ["氧化还原", "Redox reactions", "氧化还原反应涉及电子转移或氧化数变化。", "氧化是失去电子、氧化数升高；还原是得到电子、氧化数降低。", "同时识别氧化剂和还原剂。", "氧化不必然需要氧气参与。"],
    ["反应速率", "Reaction rates", "反应速率描述反应物消耗或产物生成的快慢。", "碰撞条件与活化能帮助解释温度、浓度和催化剂的影响。", "区别速率与反应最终产量。", "催化剂通常改变速率，不改变反应物总量。"],
  ], quiz: ["氧化过程中，某元素的氧化数通常如何变化？", ["降低", "升高", "不变", "必然变为零"], 1, "氧化对应失电子或氧化数升高。"] },
  { slug: "biology", name: "生物", en: "Biology", area: "细胞与遗传", areaEn: "Cells and genetics", mode: "process", blocks: [["process", "过程", "DNA 信息经转录形成 RNA，再由翻译过程指导多肽合成。"], ["comparison", "比较", "转录与翻译使用的模板、产物和发生位置不同。"]], topics: [
    ["细胞膜", "Cell membrane", "细胞膜构成细胞与外界的选择性边界。", "脂质双层与膜蛋白共同参与物质运输和信号传递。", "比较被动运输与主动运输。", "选择透过性不是完全封闭。"],
    ["酶", "Enzymes", "酶是促进特定生化反应的催化剂。", "酶降低活化能，活性受温度和酸碱度等条件影响。", "理解底物特异性与环境条件。", "酶不改变反应的平衡位置。"],
    ["DNA 复制", "DNA replication", "DNA 复制以已有 DNA 链为模板合成新链。", "碱基互补配对帮助维持遗传信息。", "区分复制、转录和翻译。", "复制并非完全没有错误。"],
    ["自然选择", "Natural selection", "自然选择使有利于特定环境下生存繁殖的遗传变异更常见。", "变异先存在，环境对不同变异产生差异性筛选。", "用种群层面解释频率变化。", "个体不会因需要而定向产生有益突变。"],
  ], quiz: ["酶通常通过什么机制加快反应？", ["提高活化能", "降低活化能", "改变平衡常数", "消耗全部底物"], 1, "酶提供较低活化能的反应途径。"] },
  { slug: "computer-science", name: "计算机科学", en: "Computer Science", area: "算法与数据结构", areaEn: "Algorithms and data structures", mode: "algorithm", blocks: [["algorithm", "算法", "二分查找反复比较有序区间的中间元素，每一步排除约一半候选。"], ["code", "代码示例", "while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); /* 比较后更新边界 */ }"]], topics: [
    ["复杂度", "Complexity", "时间复杂度描述输入规模增长时操作量的增长阶。", "大 O 是上界记号，具体性能还受常数和实现影响。", "区分最坏、平均与最好情况。", "O(n) 不代表实际运行固定 n 秒。"],
    ["数组与链表", "Arrays and linked lists", "数组支持按索引访问；链表通过节点引用连接元素。", "选择结构要比较访问、插入和空间开销。", "考虑操作位置与实现条件。", "链表插入快通常假设已定位节点。"],
    ["二分查找", "Binary search", "二分查找在有序搜索空间中每次缩小约一半范围。", "维护左右边界和循环不变量，确保不会跳过目标。", "先确认数据有序。", "无序数组不能直接套用二分查找。"],
    ["递归", "Recursion", "递归通过函数调用自身来求解更小规模的同类问题。", "必须有终止条件，并保证每一步朝终止条件推进。", "关注调用栈深度。", "没有收敛条件可能无限递归。"],
  ], quiz: ["二分查找通常要求待搜索数组具有什么性质？", ["随机排列", "有序", "没有重复项", "长度为偶数"], 1, "二分查找依据有序性排除一半候选。"] },
  { slug: "statistics", name: "统计学", en: "Statistics", area: "数据与推断", areaEn: "Data and inference", mode: "model", blocks: [["model", "模型", "样本均值是总体均值的估计量；抽样方式决定推断边界。"], ["interpretation", "解释", "相关系数衡量线性关联方向与强度，不自动证明因果。"]], topics: [
    ["总体与样本", "Population and sample", "总体是研究对象集合；样本是从中观察到的一部分。", "推断质量与抽样机制、样本量和测量质量相关。", "区分样本统计量与总体参数。", "大样本也不能自动修复严重选择偏差。"],
    ["均值与中位数", "Mean and median", "均值对所有数值敏感；中位数是排序后的中间位置。", "偏态分布或极端值存在时，两者可能差异明显。", "根据分布形态选择描述量。", "中位数不是所有数值之和除以个数。"],
    ["抽样误差", "Sampling error", "抽样误差是样本统计量随随机抽样变化产生的差异。", "它与系统性偏差不同，可用抽样分布描述。", "比较随机误差与测量偏差。", "增加样本量不能消除所有偏差。"],
    ["相关与因果", "Correlation and causation", "相关描述变量共同变化的关系。", "因果判断还需要考虑时间顺序、混淆因素与研究设计。", "列出可能的第三变量。", "相关系数显著不等于因果成立。"],
  ], quiz: ["哪项指标通常更不易受极端值影响？", ["均值", "中位数", "方差", "极差"], 1, "中位数主要取决于排序后的中间位置。"] },
  { slug: "economics", name: "经济学", en: "Economics", area: "微观经济学基础", areaEn: "Microeconomics foundations", mode: "model", blocks: [["model", "模型", "在其他条件不变时，需求曲线描述价格与需求量的关系。"], ["case", "案例", "商品价格下降可能使消费者沿同一需求曲线增加购买量；收入变化可能移动整条曲线。"]], topics: [
    ["稀缺与机会成本", "Scarcity and opportunity cost", "资源有限使选择具有机会成本。", "机会成本是放弃的最佳替代方案的价值。", "明确比较的可选方案。", "机会成本不等于所有放弃方案价值之和。"],
    ["需求与供给", "Demand and supply", "需求和供给共同影响市场价格与交易量。", "沿曲线移动与整条曲线移动的原因不同。", "区分自身价格变化与其他条件变化。", "需求量增加不一定是需求曲线右移。"],
    ["弹性", "Elasticity", "价格弹性衡量需求量对价格变化的相对反应。", "常用百分比变化之比表示，受替代品和调整时间影响。", "解释弹性大小时考虑绝对值。", "需求缺乏弹性不等于需求量完全不变。"],
    ["外部性", "Externalities", "外部性是行为对未参与交易者产生的成本或收益。", "私人决策与社会整体效果可能不一致。", "区分正外部性与负外部性。", "市场价格未必包含全部社会成本。"],
  ], quiz: ["机会成本通常指什么？", ["全部放弃选项之和", "放弃的最佳替代方案价值", "已经支付的沉没成本", "会计利润"], 1, "选择某方案时，机会成本是所放弃的最佳替代方案价值。"] },
  { slug: "finance", name: "金融学", en: "Finance", area: "风险与时间价值", areaEn: "Risk and time value", mode: "model", blocks: [["formula", "公式", "复利终值：FV=PV(1+r)^n，假定每期固定利率 r、复利 n 期。"], ["risk", "风险", "历史收益不保证未来收益；期限与现金流需求影响决策。"]], topics: [
    ["货币时间价值", "Time value of money", "相同金额在不同时间的价值可能不同。", "折现把未来现金流转换为当前可比较金额。", "明确利率、期限与复利频率。", "不能直接相加不同时间点金额而不作假设。"],
    ["复利", "Compound interest", "复利使利息在后续期间继续参与计息。", "增长速度取决于利率和复利期数。", "比较单利与复利。", "公式假设的固定利率未必符合真实产品。"],
    ["风险与收益", "Risk and return", "投资收益通常伴随不确定性。", "评估风险需看波动、损失可能与个人承受能力。", "区分预期收益与已实现收益。", "高历史收益不保证未来收益。"],
    ["分散化", "Diversification", "分散化可降低部分资产特有风险。", "若资产高度同向变动，分散效果会减弱。", "关注资产相关性与整体组合。", "分散化不能消除所有市场风险。"],
  ], quiz: ["在相同正利率和期限下，复利与单利相比通常如何？", ["更低", "相同", "更高", "无法定义"], 2, "复利中既有本金也有此前利息参与后续计息。"] },
  { slug: "history", name: "历史", en: "History", area: "历史研究基础", areaEn: "Historical inquiry", mode: "timeline", blocks: [["timeline", "时间线", "依次记录事件发生时间、后续传播和长期影响，避免把不同阶段混为一谈。"], ["evidence", "史料", "比较原始材料与后人解释，注意作者、时代和目的。"]], topics: [
    ["史料与证据", "Sources and evidence", "历史研究依据可追溯史料提出并检验解释。", "材料要结合作者、形成时间和保存过程理解。", "区分一手资料与后来的研究。", "单一材料未必能代表所有参与者。"],
    ["时间顺序", "Chronology", "时间顺序帮助识别事件先后与阶段变化。", "事件先后为解释提供条件，但不足以单独证明因果。", "构建带来源的时间线。", "先发生不等于必然造成后发生。"],
    ["原因与影响", "Causes and effects", "历史事件通常有多个背景条件和直接触发因素。", "短期结果与长期影响也可能不同。", "按政治、经济和社会维度整理。", "避免单一原因解释复杂事件。"],
    ["历史视角", "Historical perspective", "历史视角要求把人物和决策置于当时可获得的信息与条件中。", "理解情境不等于免除评价。", "比较不同群体的经验。", "不要把当代常识无条件投射到过去。"],
  ], quiz: ["某事件先于另一事件发生，单凭这一点能否证明因果？", ["能", "不能", "只要相隔一年就能", "只要有新闻就能"], 1, "时间顺序是因果判断条件之一，但还需其他证据。"] },
  { slug: "geography", name: "地理", en: "Geography", area: "自然与人文地理", areaEn: "Physical and human geography", mode: "spatial", blocks: [["spatial", "空间关系", "比较地点、尺度、距离与流动，解释地理现象的空间分布。"], ["process", "过程", "水循环包含蒸发、凝结、降水、下渗及径流等相互联系的环节。"]], topics: [
    ["地图比例尺", "Map scale", "比例尺表示地图距离与实际距离的比值。", "大比例尺显示较小范围与较多局部细节。", "计算前统一单位。", "分母大不等于比例尺大。"],
    ["气候与天气", "Climate and weather", "天气是短时间大气状态；气候描述较长时期的统计特征。", "判断气候变化需较长时间序列。", "区分单日事件与长期趋势。", "一次寒潮不能单独否定长期变暖。"],
    ["水循环", "Water cycle", "水在大气、地表和地下储库之间循环。", "蒸发、降水、下渗和径流受能量及地形条件影响。", "按流向绘制过程。", "水循环并非各地各环节等速发生。"],
    ["人口迁移", "Human migration", "人口迁移涉及居住地的空间转移。", "经济、环境和社会因素可能共同作用。", "分析迁出地与迁入地影响。", "不能把所有迁移归因于收入差。"],
  ], quiz: ["大比例尺地图一般呈现什么特点？", ["范围更大细节更少", "范围更小细节更多", "没有空间信息", "只显示气候"], 1, "大比例尺地图覆盖较小区域，可展示较多细节。"] },
  { slug: "philosophy", name: "哲学", en: "Philosophy", area: "论证与认识", areaEn: "Arguments and knowledge", mode: "argument", blocks: [["argument", "论证", "先找结论，再找前提；检查前提是否支持结论及可能的反例。"], ["comparison", "比较", "有效性关心推理结构，真实性关心前提是否符合事实。"]], topics: [
    ["论证的结构", "Argument structure", "论证用前提支持结论。", "清晰区分主张、理由和隐含假设。", "重述论证后检查推理。", "观点表达不一定构成论证。"],
    ["演绎与归纳", "Deduction and induction", "演绎关注前提与结论间的必然关系；归纳从有限观察推及更广范围。", "两种推理的评价标准不同。", "分别识别有效性与证据强度。", "归纳结论通常不是逻辑必然。"],
    ["知识与证据", "Knowledge and evidence", "知识主张需要说明依据、可靠性及反驳可能。", "不同领域可采用不同证据方法。", "区分相信某事与证明某事。", "强烈确信本身不保证正确。"],
    ["伦理判断", "Ethical reasoning", "伦理判断研究何种行动有理由被认为恰当。", "可比较后果、规则、品格和权利等不同视角。", "先澄清事实，再比较价值冲突。", "描述人们实际行为不等于证明其正当。"],
  ], quiz: ["论证中的前提主要起什么作用？", ["装饰结论", "支持结论", "代替事实核验", "保证所有人同意"], 1, "前提为结论提供理由。"] },
  { slug: "sociology", name: "社会学", en: "Sociology", area: "社会结构与研究", areaEn: "Social structures and research", mode: "case", blocks: [["case", "案例", "比较同一规则对不同社会群体的影响，避免只依据个人经历推断整体。"], ["method", "研究方法", "问卷可描述群体差异；因果结论仍需处理抽样与混淆。"]], topics: [
    ["社会规范", "Social norms", "社会规范是群体中关于可接受行为的期待。", "规范会随时间、场域和群体变化。", "区分正式与非正式规范。", "观察到某行为常见不等于所有人都认可。"],
    ["社会角色", "Social roles", "社会角色与特定社会位置的期待相关。", "同一人可能承担多个角色并遭遇角色冲突。", "用情境分析期待来源。", "角色不等于个体全部身份。"],
    ["社会分层", "Social stratification", "社会分层描述资源、机会和地位的不均等分布。", "研究时需明确指标和比较群体。", "区分描述差异与解释成因。", "不能由群体平均推断每个个体。"],
    ["社会调查", "Social survey", "社会调查通过系统收集资料研究群体特征与看法。", "抽样、题目措辞和回应偏差影响结果。", "检查样本代表性。", "问卷百分比不自动代表全体人口。"],
  ], quiz: ["问卷样本严重偏向某一群体时，首先影响什么？", ["问题的字体", "结果的代表性", "数据格式", "研究标题"], 1, "偏向样本会限制对目标总体的推断。"] },
  { slug: "law", name: "法学", en: "Law", area: "法律思维基础", areaEn: "Foundations of legal reasoning", mode: "case", blocks: [["case", "案例分析", "识别事实、适用规范、构成要件和可能的抗辩；不同法域与时间的具体规则须核对现行法。"], ["source", "法源", "法律文本、解释与判例的效力因法域而异，学习时记录适用范围与日期。"]], topics: [
    ["法律规范", "Legal norms", "法律规范规定特定条件下的行为要求或法律后果。", "解读规范要看适用主体、事实条件和效力时间。", "区分规则文本与对规则的解释。", "不能脱离法域与时间套用条文。"],
    ["事实与证据", "Facts and evidence", "法律分析依赖可证明的事实。", "主张、证据及证明标准需分开。", "建立证据与待证事实的对应。", "合理怀疑或推测不能直接当作已证事实。"],
    ["构成要件", "Legal elements", "构成要件把法律后果与必要事实条件相连接。", "按要件逐一检查事实，再讨论例外与抗辩。", "逐项说明证据支持程度。", "相似事实不必然满足全部要件。"],
    ["法律解释", "Legal interpretation", "法律解释在文本、体系、目的和适用情境之间寻求合理理解。", "具体方法及其权重依法律体系而异。", "说明解释依据与不确定性。", "个人直觉不能替代有效法源。"],
  ], quiz: ["分析某法律规则是否适用时，首先应核对什么？", ["只看标题", "适用法域与时间", "网络点赞数", "个人偏好"], 1, "法律规则的适用范围和效力时间是分析前提。"] },
];

export const UNIVERSAL_CONTENT_VERSION = "2026.09-universal-1";
const blockIndex: Record<string, number> = {
  mathematics: 2, physics: 2, chemistry: 1, biology: 2, "computer-science": 2,
  statistics: 0, economics: 1, finance: 1, history: 1, geography: 2,
  philosophy: 0, sociology: 3, law: 2,
};
export function createUniversalContent(): { subjects: BetaSubject[]; chapters: BetaChapter[]; points: BetaKnowledgePoint[]; questions: BetaQuestion[] } {
  const now = new Date().toISOString(); const base = { ownerId: "local-owner", createdAt: now, updatedAt: now };
  const subjects = paths.map((path) => ({ ...base, id: `subject-universal-${path.slug}`, slug: path.slug, name: path.name, nameEn: path.en, learningMode: path.mode }));
  const chapters = paths.map((path) => ({ ...base, id: `chapter-universal-${path.slug}-intro`, subjectId: `subject-universal-${path.slug}`, title: path.area, titleEn: path.areaEn, order: 1 }));
  const points: BetaKnowledgePoint[] = paths.flatMap((path) => path.topics.map(([title, titleEn, coreConcept, explanation, keyPoints, pitfalls], index) => ({
    ...base, id: `point-universal-${path.slug}-${index + 1}`, subjectId: `subject-universal-${path.slug}`,
    chapterId: `chapter-universal-${path.slug}-intro`, title, titleEn, coreConcept, explanation, keyPoints, pitfalls,
    learningBlocks: index === blockIndex[path.slug] ? path.blocks.map(([kind, blockTitle, body]) => ({ kind, title: blockTitle, body })) : undefined,
    importance: index === 0 ? 5 as const : 3 as const, contentVersion: UNIVERSAL_CONTENT_VERSION,
    personalNote: "", mastery: "new" as const, favorite: false,
  })));
  for (const point of points) point.relatedPointIds = points.filter((entry) => entry.chapterId === point.chapterId && entry.id !== point.id).slice(0, 2).map((entry) => entry.id);
  const questions = paths.map((path) => ({
    ...base, id: `question-universal-${path.slug}-intro`, subjectId: `subject-universal-${path.slug}`,
    chapterId: `chapter-universal-${path.slug}-intro`, knowledgePointId: `point-universal-${path.slug}-1`,
    examType: "system-practice", questionType: "single" as const, stem: path.quiz[0],
    options: path.quiz[1].map((text, index) => ({ id: String(index), text })), answer: [String(path.quiz[2])],
    explanation: path.quiz[3], difficulty: "easy" as const, source: "Personal Learning OS 系统原创练习题", tags: ["系统练习题"],
  }));
  return { subjects, chapters, points, questions };
}
