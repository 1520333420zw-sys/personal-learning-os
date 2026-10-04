import type { BetaKnowledgePoint, BetaState } from "@/domain/beta";
import type { Curriculum, CurriculumChapter, CurriculumSection, TeachingUnit } from "@/domain/learning/curriculum";

export const PSYCHOLOGY_BOOKS_VERSION = "2026.10-psychology-books-1";

export type BookCurriculumStatus = "verified" | "needs_pdf_calibration";

export interface BookCurriculum extends Curriculum {
  author: string;
  edition: string;
  status: BookCurriculumStatus;
  sourceNote: string;
}

export interface BookChapter extends CurriculumChapter {
  chapterNumber: number;
  sourceStatus: BookCurriculumStatus;
}

export interface BookSection extends CurriculumSection {
  sectionNumber: number;
  kind?: "textbook" | "chapter_review";
  sourceStatus: BookCurriculumStatus;
  sourceNote: string;
  teaching?: Omit<TeachingUnit, "sectionId" | "quickCheckQuestionIds" | "recitationIds">;
}

interface ChapterSeed {
  title: string;
  sections: string[];
  verified?: boolean;
}

interface BookSeed {
  id: string;
  sourceChapterId: string;
  title: string;
  titleEn: string;
  author: string;
  edition: string;
  status: BookCurriculumStatus;
  sourceNote: string;
  chapters: ChapterSeed[];
}

const generalChapters: ChapterSeed[] = [
  { title: "心理学的研究对象和方法", sections: ["心理学的研究对象", "心理学的基本任务、研究领域和学科性质", "心理学的研究方法", "心理学的过去和现在"], verified: true },
  { title: "心理与行为的脑神经基础", sections: ["神经元", "神经系统", "脑功能学说", "神经系统的进化与脑的可塑性"], verified: true },
  { title: "感觉", sections: ["感觉概述", "视觉", "听觉", "化学感觉", "躯体感觉"], verified: true },
  { title: "知觉", sections: ["知觉及其特征", "空间知觉", "时间知觉与运动知觉", "错觉"], verified: true },
  { title: "意识", sections: ["意识概述", "注意", "睡眠和梦", "意识的其他状态"], verified: true },
  { title: "记忆", sections: ["记忆概述", "感觉记忆", "短时记忆和工作记忆", "长时记忆", "内隐记忆"], verified: true },
  { title: "思维", sections: ["思维概述", "表象和概念", "推理和问题解决", "决策"], verified: true },
  { title: "语言", sections: ["语言概述", "口头语言的加工", "书面语言的加工", "双语的加工"], verified: true },
  { title: "动机", sections: ["动机概述", "生理性动机", "社会性动机", "动机理论"], verified: true },
  { title: "情绪", sections: ["情绪概述", "情绪的外部表现——表情", "情绪理论", "情绪智力与情绪调节"], verified: true },
  { title: "智力", sections: ["智力的概念和理论", "智力的测量", "智力的发展与个体差异", "影响智力的因素"], verified: true },
  { title: "人格", sections: ["人格概述", "人格理论", "人格测评", "人格的形成"], verified: true },
  { title: "学习", sections: ["学习概述", "学习的规律", "学习理论", "教学方法与学习"], verified: true },
  { title: "人生全程发展", sections: ["个体发展概述", "身体、动作与感知觉发展", "语言与其他高级认知能力的发展", "心理社会性发展"], verified: true },
];

const developmentChapters: ChapterSeed[] = [
  { title: "绪论", sections: ["发展心理学的界说", "发展心理学的变迁", "发展心理学的进展与展望"], verified: true },
  { title: "发展心理学理论", sections: ["精神分析的心理发展观", "行为主义的心理发展观", "维果茨基的心理发展观", "皮亚杰的心理发展观", "朱智贤的心理发展观"], verified: true },
  { title: "发展心理学研究方法", sections: ["发展心理学研究概述", "发展心理学研究的设计", "收集研究资料的常用方法", "研究结果的分析", "研究方法的新趋势"], verified: true },
  { title: "胎儿的生理和心理发展", sections: ["胎儿神经生理和心理机能的发展", "胎儿发展的影响因素", "胎儿期的心理卫生"], verified: true },
  { title: "婴儿的心理发展", sections: ["婴儿的生理发展及其心理学意义", "婴儿认知的发展", "婴儿言语的发展", "婴儿的气质", "婴儿的社会性依恋"], verified: false },
  { title: "幼儿的心理发展", sections: ["幼儿认知的发展", "幼儿言语的发展", "幼儿个性和社会性的发展"], verified: false },
  { title: "童年期儿童的心理发展", sections: ["认知发展", "学习发展", "个性和社会性发展"], verified: false },
  { title: "青少年的心理发展", sections: ["生理发展", "认知发展", "个性和社会性发展"], verified: false },
  { title: "成年早期的心理发展", sections: ["成年早期的发展任务", "认知与社会性发展"], verified: false },
  { title: "成年中期的心理发展", sections: ["成年中期的发展任务", "认知与社会性发展"], verified: false },
  { title: "成年晚期的心理发展", sections: ["老化与认知变化", "人格、社会关系与适应"], verified: false },
];

const educationChapters: ChapterSeed[] = [
  { title: "走进教育心理学", sections: ["教育心理学概述", "教育心理学的研究方法", "教育心理学的发展历程"], verified: true },
  { title: "学生的心理发展", sections: ["学生的认知发展", "学生的个性和社会化发展"], verified: true },
  { title: "学生的个体差异", sections: ["个体的智力差异", "个体的学习风格差异", "特殊需要儿童的教育"], verified: true },
  { title: "行为主义学习理论", sections: ["学习及其理论发展", "经典性条件作用", "操作性条件作用", "社会学习理论"], verified: true },
  { title: "认知学习理论", sections: ["学习的信息加工过程", "知识的组织结构"], verified: true },
  { title: "建构主义学习理论", sections: ["建构主义概述", "学习的认知建构过程", "学习的社会建构过程"], verified: true },
  { title: "人本主义学习理论及应用", sections: ["人本主义学习理论", "人本主义的教学应用"], verified: true },
  { title: "学习动机", sections: ["学习动机及其理论", "学习动机的个体因素", "学习动机的情境因素"], verified: true },
  { title: "知识建构", sections: ["知识概述", "知识的学习", "知识迁移"], verified: true },
  { title: "问题解决与创造性", sections: ["问题与问题解决", "问题解决过程", "问题解决能力的培养", "创造性"], verified: true },
  { title: "自我调节学习", sections: ["自我调节学习及其理论", "自我调节学习的策略", "自我调节学习的训练"], verified: true },
  { title: "品德学习", sections: ["道德认知的发展及培养", "道德情感的形成及培养", "道德行为的形成及培养", "常见道德问题及其矫正"], verified: true },
  { title: "有效教学", sections: ["有效教学与教学设计", "教学目标", "教学模式"], verified: true },
  { title: "课堂测评", sections: ["课堂测评概述", "传统的课堂测评方法", "非传统的课堂测评方法", "课堂测评的使用"], verified: true },
  { title: "课堂管理", sections: ["课堂管理概述", "课堂的物理环境", "课堂的社会环境", "课堂管理设计与特殊方法", "学生的行为管理"], verified: true },
  { title: "教师心理", sections: ["理想教师", "教师的专业素质", "教师的心理健康", "教师的成长和培养"], verified: true },
];

const experimentalChapters: ChapterSeed[] = [
  { title: "绪论", sections: ["实验心理学的由来", "实验心理学的科学属性", "实验心理学的方法学地位", "如何进行实验心理学研究"], verified: true },
  { title: "实验研究的基本问题", sections: ["实验研究的变量", "实验研究的设计", "实验研究的效度和信度", "实验研究的仪器"], verified: true },
  { title: "如何读和写心理学实验报告", sections: ["文献检索", "核对清单阅读法", "心理学实验报告的写作", "学生心理学实验报告的写作"], verified: true },
  { title: "反应时", sections: ["反应时的研究历史", "反应时研究的基本问题", "反应时新法", "反应时研究的新进展"], verified: true },
  { title: "心理物理学", sections: ["传统心理物理学", "心理物理函数", "感觉的直接测量", "信号检测论"], verified: true },
  { title: "注意", sections: ["注意的理论和实验", "注意的操作定义", "注意的研究方法", "注意的应用研究"], verified: true },
  { title: "知觉", sections: ["直接知觉和间接知觉", "视知觉和听知觉", "空间知觉", "时间知觉", "无觉察知觉"], verified: true },
  { title: "记忆与学习", sections: ["记忆与学习的传统研究", "记忆的类型", "内隐记忆", "内隐学习"], verified: true },
  { title: "思维", sections: ["思维的研究方法", "思维研究的领域", "思维中的无意识过程", "思维和人工智能"], verified: true },
  { title: "情绪", sections: ["情绪的产生和获得", "情绪的认知研究", "情绪的测量", "情绪的研究方法"], verified: true },
];

const socialChapters: ChapterSeed[] = [
  { title: "社会心理学导论", sections: ["为什么要学习社会心理学", "什么是社会心理学", "社会心理学简史"], verified: true },
  { title: "社会心理学的理论与方法", sections: ["社会心理学研究的基本问题", "社会心理学的基本理论", "研究过程与方法选择"], verified: true },
  { title: "自我", sections: ["关于自我研究的历史", "和自我有关的概念", "自我偏差", "自我与文化"], verified: true },
  { title: "社会认知", sections: ["社会认知", "个人知觉", "归因"], verified: true },
  { title: "社会行为", sections: ["人类社会行为的基础", "侵犯行为", "亲社会行为"], verified: true },
  { title: "态度", sections: ["态度概述", "态度的形成", "态度改变"], verified: true },
  { title: "人际关系与社会影响", sections: ["人际吸引与亲密关系", "从众与服从", "群体过程"], verified: false },
  { title: "文化与社会心理", sections: ["文化、自我与社会行为", "文化差异的解释边界"], verified: false },
];

const statisticsChapters: ChapterSeed[] = [
  { title: "绪论", sections: ["统计方法在心理与教育科学研究中的作用", "心理与教育统计学的内容", "心理与教育统计学的发展", "心理与教育统计基础概念"], verified: true },
  { title: "统计图表", sections: ["数据的初步整理", "次数分布表", "次数分布图", "其他类型的统计图表"], verified: true },
  { title: "集中量数", sections: ["算术平均数", "中数与众数", "其他集中量数"], verified: true },
  { title: "差异量数", sections: ["全距与百分位差", "平均差、方差与标准差", "标准差的应用", "差异量数的选用"], verified: true },
  { title: "相关关系", sections: ["相关、相关系数与散点图", "积差相关", "等级相关", "质与量相关", "品质相关", "相关系数的选用与解释"], verified: true },
  { title: "概率分布", sections: ["概率的基本概念", "正态分布", "二项分布", "抽样分布"], verified: true },
  { title: "参数估计", sections: ["点估计、区间估计与标准误", "总体平均数的估计", "标准差与方差的区间估计", "相关系数的区间估计", "比率及比率差异的区间估计"], verified: true },
  { title: "假设检验", sections: ["假设检验的原理", "平均数的显著性检验", "平均数差异的显著性检验", "方差的差异检验", "相关系数的显著性检验", "比率的显著性检验"], verified: true },
  { title: "方差分析", sections: ["方差分析的基本原理及步骤", "完全随机设计的方差分析", "随机区组设计的方差分析", "事后检验"], verified: true },
  { title: "χ²检验", sections: ["χ²检验的原理", "拟合优度检验", "独立性检验", "同质性检验与数据的合并", "相关源的分析"], verified: true },
  { title: "非参数检验", sections: ["非参数检验的基本概念与特点", "两个独立样本的非参数检验方法", "配对样本的非参数检验方法", "等级方差分析"], verified: true },
  { title: "线性回归", sections: ["线性回归模型的建立方法", "回归模型的检验与估计", "回归方程的应用"], verified: true },
  { title: "多变量统计分析简介", sections: ["多因素方差分析", "多重线性回归", "因子分析"], verified: true },
  { title: "抽样原理及方法", sections: ["抽样的意义和原则", "几种重要的随机抽样方法", "样本容量的确定"], verified: true },
];

const measurementChapters: ChapterSeed[] = [
  { title: "心理与教育测量概论", sections: ["测量的性质与水平", "心理与教育测量的功能"], verified: true },
  { title: "心理与教育测量简史", sections: ["测量运动的发展", "中国心理与教育测量的发展"], verified: true },
  { title: "经典测验理论的基本假设", sections: ["真分数模型", "测量误差"], verified: true },
  { title: "测量信度", sections: ["信度的含义", "信度估计方法", "影响信度的因素"], verified: true },
  { title: "测量效度", sections: ["效度的含义", "效度证据", "影响效度的因素"], verified: true },
  { title: "测验的项目分析", sections: ["项目难度", "项目区分度", "项目分析的综合应用"], verified: true },
  { title: "心理与教育测验的编制与实施", sections: ["测验编制流程", "测验实施与质量控制"], verified: true },
  { title: "常模参照测验", sections: ["常模与常模团体", "标准分数与分数解释"], verified: true },
  { title: "目标参照测验", sections: ["目标参照测验的特点", "分数解释与评价"], verified: true },
  ...Array.from({ length: 7 }, (_, index) => ({ title: `第${index + 10}章（待教材 PDF 校准）`, sections: ["系统教学单元：测验类型、使用与解释"], verified: false })),
  { title: "测量理论与应用的新发展", sections: ["现代测量理论", "测量技术与应用的发展"], verified: true },
];

const books: BookSeed[] = [
  { id: "curriculum-psych-general-6", sourceChapterId: "psych-general", title: "《普通心理学》第六版", titleEn: "General Psychology, 6th Edition", author: "彭聃龄、陈宝国", edition: "第六版", status: "verified", sourceNote: "章、节名称与顺序依据用户指定 PDF 目录及公开书目信息核验；教学正文为系统原创转述。", chapters: generalChapters },
  { id: "curriculum-psych-development-3", sourceChapterId: "psych-development", title: "《发展心理学》第三版", titleEn: "Developmental Psychology, 3rd Edition", author: "林崇德", edition: "第三版", status: "needs_pdf_calibration", sourceNote: "前五章目录经人民教育出版社公开目录核验；后续年龄阶段依据出版社内容介绍组织，待用户 PDF 校准小节。", chapters: developmentChapters },
  { id: "curriculum-psych-education-3", sourceChapterId: "psych-education", title: "《当代教育心理学》第三版", titleEn: "Contemporary Educational Psychology, 3rd Edition", author: "陈琦、刘儒德", edition: "第三版", status: "verified", sourceNote: "章、节名称与顺序依据高等教育出版社公开目录核验；教学正文为系统原创转述。", chapters: educationChapters },
  { id: "curriculum-psych-experimental-2004", sourceChapterId: "psych-experimental", title: "《实验心理学》2004版", titleEn: "Experimental Psychology, 2004 Edition", author: "郭秀艳", edition: "2004版", status: "verified", sourceNote: "章、节名称与顺序依据人民教育出版社公开目录核验；教学正文为系统原创转述。", chapters: experimentalChapters },
  { id: "curriculum-psych-social-4", sourceChapterId: "psych-social", title: "《社会心理学》第四版", titleEn: "Social Psychology, 4th Edition", author: "侯玉波", edition: "第四版", status: "needs_pdf_calibration", sourceNote: "前六章小节依据公开课程资料核验；后续部分使用系统教学结构，待用户 PDF 校准。", chapters: socialChapters },
  { id: "curriculum-psych-measurement-4", sourceChapterId: "psych-measurement", title: "《心理与教育测量》第四版", titleEn: "Psychological and Educational Measurement, 4th Edition", author: "戴海崎、张锋", edition: "第四版", status: "needs_pdf_calibration", sourceNote: "第1—9章及第17章由公开书目核验；第10—16章标题待用户 PDF 校准，不伪造教材原目录。", chapters: measurementChapters },
  { id: "curriculum-psych-statistics-5", sourceChapterId: "psych-statistics", title: "《现代心理与教育统计学》第五版", titleEn: "Modern Psychological and Educational Statistics, 5th Edition", author: "张厚粲、徐建平", edition: "第五版", status: "verified", sourceNote: "章、节名称与顺序依据公开书目目录核验；教学正文为系统原创转述。", chapters: statisticsChapters },
];

const keywordGroups: Record<string, string[]> = {
  "心理学的研究对象": ["心理学概述", "研究对象", "心理现象"], "心理学的研究方法": ["研究", "证据"], "神经元": ["神经元", "突触"],
  "感觉概述": ["感觉", "阈限", "信号检测"], "知觉及其特征": ["知觉", "恒常", "组织"], "注意": ["注意"], "短时记忆和工作记忆": ["工作记忆", "短时"],
  "长时记忆": ["长时记忆", "遗忘"], "推理和问题解决": ["问题解决", "推理"], "动机概述": ["动机"], "情绪概述": ["情绪"], "人格概述": ["人格"],
  "归因": ["归因"], "态度概述": ["态度"], "从众与服从": ["从众", "服从"], "侵犯行为": ["侵犯"], "亲社会行为": ["亲社会"],
  "皮亚杰的心理发展观": ["皮亚杰"], "婴儿的社会性依恋": ["依恋"], "青少年的心理发展": ["青少年", "同一性"], "老化与认知变化": ["老化", "成年晚期"],
  "操作性条件作用": ["强化"], "知识迁移": ["迁移"], "自我调节学习及其理论": ["元认知", "自我调节"],
  "实验研究的变量": ["变量", "操作定义"], "实验研究的设计": ["随机分配", "组间", "组内", "顺序效应"], "反应时研究的基本问题": ["反应时"], "信号检测论": ["信号检测"],
  "平均差、方差与标准差": ["标准差", "方差"], "点估计、区间估计与标准误": ["置信区间", "标准误"], "假设检验的原理": ["p 值", "假设检验"], "线性回归模型的建立方法": ["回归"],
  "信度的含义": ["信度"], "效度的含义": ["效度"], "常模与常模团体": ["常模"], "真分数模型": ["经典测验理论"], "项目难度": ["项目难度"], "项目区分度": ["项目区分度"],
};

type SectionNote = [plain: string, formal: string, example: string];
const sectionNotes: Record<string, SectionNote> = {
  "心理学的基本任务、研究领域和学科性质": ["心理学既要描述现象、解释原因，也要预测在什么条件下可能发生，并在尊重伦理的前提下帮助改善生活。基础研究与应用研究关注点不同，但都依赖可检验的证据。", "心理学的基本任务包括描述、解释、预测与控制或干预；其研究领域覆盖基础心理过程与教育、工程、临床等应用领域，学科兼具自然科学和社会科学属性。", "发现睡眠不足与注意下降有关只是描述关系；进一步控制条件、检验机制，才能解释原因并设计有效干预。"],
  "心理学的过去和现在": ["今天的心理学并不是由单一学派决定的。构造主义、机能主义、行为主义、精神分析、格式塔、认知与人本取向分别提出了不同问题，现代研究常把多层证据结合起来。", "心理学史体现研究对象和方法从思辨走向实验与多方法整合的过程；现代心理学同时关注行为、认知、神经机制与社会文化情境。", "解释记忆时，研究者既可以测反应和正确率，也可以研究脑活动，还要考虑任务与文化经验。"],
  "神经系统": ["神经系统像分层协作的通信网络：中枢神经系统负责整合，外周神经系统连接身体；躯体与自主神经系统承担不同调节任务。", "神经系统由中枢神经系统和外周神经系统组成，外周系统又可按功能区分躯体与自主部分；自主神经系统中的交感和副交感活动共同维持机体调节。", "遇到突然声响时，交感活动帮助身体快速动员；危险解除后，副交感活动促进恢复。"],
  "脑功能学说": ["大脑功能既有相对专门化，也依赖网络协作。说某一区域参与语言，不等于语言只由这一个区域完成。", "脑功能研究从定位论与整体论的争论发展到功能专门化和分布式网络相结合的观点。", "阅读一个句子会同时涉及视觉分析、词义提取、句法加工、工作记忆和控制网络。"],
  "神经系统的进化与脑的可塑性": ["大脑不是出生后固定不变的器官。经验、训练、损伤与发展阶段都会改变神经连接，但可塑性受生物条件和时间窗口限制。", "脑可塑性是神经系统在经验或损伤影响下改变结构与功能组织的能力；这种改变具有适应性，也可能产生不良后果。", "练习乐器可改变相关感觉运动网络；损伤后的功能恢复也常依靠剩余网络重新组织。"],
  "视觉": ["视觉从光刺激开始，经视网膜把光能转换为神经信号，再由多级通路分析颜色、形状、运动和空间。我们看到的世界是加工结果，不是照相式复制。", "视觉是光刺激作用于视觉器官，经感受、编码和中枢加工形成的感觉过程。", "同一灰块放在明暗不同的背景上看起来亮度不同，说明视觉取决于刺激关系与加工。"],
  "听觉": ["声音的频率、振幅和波形分别与音高、响度和音色有关。耳蜗把机械振动转换为神经信号，但知觉还受注意和经验影响。", "听觉是声波作用于听觉器官，经机械传导、换能与中枢加工形成的声音感觉。", "同一段话在嘈杂环境中更难听清；看到说话者口型又可能帮助恢复语音信息。"],
  "化学感觉": ["味觉和嗅觉都依赖化学分子与受体作用，并共同塑造‘风味’。感冒时食物变得寡淡，常不是味觉完全失效，而是嗅觉输入减少。", "化学感觉主要包括味觉和嗅觉，是化学刺激经相应感受器编码后形成的感觉。", "捏住鼻子吃水果糖时难以辨认具体味道，松开鼻子后风味立即清晰。"],
  "躯体感觉": ["触压、温度、痛觉和本体感觉共同告诉我们身体与外界接触以及身体各部分的位置。痛觉既有保护作用，也受注意、期待和情绪调节。", "躯体感觉是来自皮肤、肌肉、关节和内脏等受体的信息所形成的感觉，包括触压觉、温度觉、痛觉和本体感觉等。", "闭眼仍能判断手臂抬起的位置，依靠的主要是本体感觉而不是视觉。"],
  "空间知觉": ["我们利用双眼差异、遮挡、线性透视、相对大小以及运动线索估计距离和立体结构；不同线索可能互相补充。", "空间知觉是对物体形状、大小、方位、距离和深度等空间属性的知觉。", "铁轨在远处看似汇合，这是线性透视提供深度线索，而不是铁轨真的变窄。"],
  "时间知觉与运动知觉": ["时间没有单一外部感受器，持续时间判断会受注意、情绪和事件数量影响；运动知觉则综合位置变化、眼动和背景关系。", "时间知觉是对事件顺序和持续性的知觉，运动知觉是对物体空间位移或变化的知觉。", "等待迟到的人时几分钟可能显得很长；投入有趣任务时同样时长常觉得很短。"],
  "错觉": ["错觉不是随意幻想，而是在特定刺激条件下出现的稳定知觉偏差。它能帮助我们理解知觉系统使用了哪些线索和假设。", "错觉是在客观刺激存在时产生的、不符合刺激物理特征的知觉经验。", "缪勒—莱尔图形中两条等长线段看起来不同长，反映端点线索影响长度判断。"],
  "睡眠和梦": ["睡眠并非大脑完全停止活动，而是具有周期性阶段的主动过程。不同睡眠阶段在脑电、眼动、肌张力和梦境报告上有不同表现。", "睡眠是周期性发生的意识状态，通常由非快速眼动睡眠与快速眼动睡眠交替构成。", "快速眼动睡眠中脑活动较活跃、骨骼肌张力降低，醒后较常报告生动梦境。"],
  "意识的其他状态": ["冥想、催眠、药物影响和极端疲劳都可能改变觉知范围与控制感，但不能简单等同于‘失去意识’。", "意识状态可在觉醒水平、注意范围、自我监控和控制体验等维度发生变化。", "专注呼吸时外界刺激仍存在，但注意范围与对念头的反应方式发生了变化。"],
  "内隐记忆": ["有些过去经验会影响现在的表现，即使我们不能有意识地回忆那次经验。判断内隐记忆要靠任务间的分离证据。", "内隐记忆是过去经验对当前行为产生影响，而个体不需要有意识回忆该经验的记忆表现。", "先前见过某个词后，补全词干可能更快，但本人未必记得见过这个词。"],
  "决策": ["决策是在多个选项之间权衡结果与概率。人在不确定条件下常使用启发式，因此高效但也可能产生系统偏差。", "决策是个体依据目标、信息、价值和风险在备选方案间作出选择的认知过程。", "只因某类事故容易被新闻想起就高估其发生概率，是可得性启发影响判断。"],
  "语言概述": ["语言是一套用符号和规则表达意义的系统。音位、语素、词、句法和语用处在不同层级，理解时需要把形式与情境结合。", "语言是人类借助语音、文字或手势符号，按照规则进行信息交流和思维表达的系统。", "‘可以关窗吗’在字面上询问能力，在多数情境中实际表达请求，体现语用信息。"],
  "口头语言的加工": ["听懂话语需要把连续声流切分成词，识别语音并结合句法、语义和语境。听者会边听边形成解释，而不是等句子结束才开始。", "口语加工包括语音感知、词汇通达、句法分析、语义整合与语用推断等相互作用的过程。", "在嘈杂环境里，句子上下文能帮助补足没有听清的词。"],
  "书面语言的加工": ["阅读把视觉符号转换为语音和意义表征，还需要眼跳、词汇识别、句法分析与篇章整合协同工作。", "书面语言加工是从文字视觉输入到词汇、句法、语义和篇章理解的多层加工过程。", "读到歧义句时，后文信息可能迫使读者回看并重新分析先前结构。"],
  "双语的加工": ["双语者的两种语言并非各自完全关闭。即使只使用一种语言，另一种语言的词汇和语音也可能被部分激活，需要控制系统选择目标语言。", "双语加工涉及两种语言表征的共同激活、选择与控制，以及语言之间的促进和干扰。", "看到英汉形似或意义相关的词时，另一种语言可能影响当前词的识别速度。"],
  "生理性动机": ["饥饿、口渴等动机与内稳态调节有关，但行为不只由生理缺口决定，也受线索、习惯和社会情境影响。", "生理性动机是以机体需要和内稳态调节为基础、推动相应行为的动机。", "即使刚吃饱，看到喜爱的甜点仍可能继续进食，说明外部线索也参与调节。"],
  "社会性动机": ["成就、交往、权力等动机在社会经验中形成，目标相似的人也可能因价值和期待不同而采取不同策略。", "社会性动机是在社会生活和学习中形成、指向社会目标的动机。", "两位学生都想取得好成绩，一位追求掌握知识，另一位主要避免显得能力差。"],
  "动机理论": ["不同理论分别强调本能与驱力、诱因、期待与价值、自我决定等机制。答题时要说明理论关注的变量和能解释的情境。", "动机理论是对行为为何启动、选择方向并持续的系统解释，不同理论在需要、认知评价和环境作用上的侧重不同。", "同一奖励在被理解为能力反馈时可能增强投入，在被理解为控制时可能削弱自主感。"],
  "情绪的外部表现——表情": ["面部、姿态和声调会传递情绪信息，但表情与内部体验不是机械一一对应，社会规则会影响表达。", "表情是情绪在面部、身体姿态和言语声调等方面的外部表现。", "人在正式场合可能压低不满的表情，这不代表内部情绪完全消失。"],
  "情绪理论": ["情绪理论争论生理唤醒、主观体验和认知评价谁先发生、怎样互动。比较理论时要抓住各自的因果顺序。", "情绪理论用于解释刺激、生理反应、认知评价、主观体验和行为表达之间的关系。", "同样的心跳加快在比赛前可被解释为兴奋，在陌生危险情境中可被解释为恐惧。"],
  "情绪智力与情绪调节": ["情绪智力强调识别、理解和管理情绪信息；调节不是压住所有情绪，而是根据目标改变情绪发生或表达的过程。", "情绪调节是个体影响自己拥有什么情绪、何时产生以及如何体验和表达情绪的过程。", "考试前把紧张重新理解为身体正在动员，属于认知重评。"],
  "智力的概念和理论": ["智力通常涉及学习、推理、解决问题和适应环境的能力。不同理论对它是一种一般能力还是多种相对独立能力有不同解释。", "智力是个体理解复杂观念、有效适应环境、从经验中学习并进行推理和问题解决的综合能力。", "一个人语言推理突出而空间操作一般，提醒我们区分总体水平与具体能力结构。"],
  "智力的测量": ["智力测验用标准化任务抽样估计能力表现，分数必须放在常模、信度、效度和测量误差中解释。", "智力测量是使用标准化工具对相关认知能力表现进行取样、计分并参照规范解释的过程。", "一次测验得分 100 表示相对某一常模的平均位置，并不代表拥有固定数量的‘智力单位’。"],
  "智力的发展与个体差异": ["智力随发展和教育经验变化，不同能力的发展轨迹也不同。群体平均差异不能直接推断单个个体。", "智力发展与个体差异是遗传、环境、教育和个体活动长期共同作用的结果。", "同龄学生在加工速度、知识经验和策略使用上可能形成不同优势。"],
  "影响智力的因素": ["遗传提供发展条件，环境和教育影响这些条件如何实现；二者持续交互，不能用单因果解释个体差异。", "智力受到遗传、家庭、教育、社会文化、营养健康和个体实践等多方面因素的共同影响。", "相同遗传倾向在教育机会不同的环境中可能形成不同能力表现。"],
  "人格理论": ["人格理论从特质、动力、学习、认知与人本等角度解释稳定差异。比较时要看基本假设、研究证据和适用边界。", "人格理论是对人格结构、形成、发展及其影响行为方式的系统解释。", "特质理论描述一个人的相对稳定倾向，社会认知理论则更强调人与情境的交互。"],
  "人格测评": ["人格不能靠单次印象判断。自陈量表、投射技术、访谈和行为观察各有优势与误差来源，需要结合目的与证据。", "人格测评是用标准化或系统方法收集人格相关信息，并对其结构和表现作出谨慎解释的过程。", "求职人格量表可能受到社会赞许反应影响，因此解释时要结合效度指标和其他资料。"],
  "人格的形成": ["人格在气质基础上，通过家庭互动、社会文化、重要经历和主动选择逐步形成，并在生命过程中保持一定可塑性。", "人格形成是生物基础、社会环境和个体实践长期交互作用的结果。", "同样内向的气质在支持性环境中可能发展为沉稳，在排斥环境中可能伴随回避。"],
  "学习概述": ["学习强调由经验或练习引起的相对持久变化。疲劳、药物或自然成熟造成的短暂变化通常不作为学习。", "学习是个体由于经验或练习而产生的、在行为或行为潜能上相对持久的变化。", "反复练习后能更准确地操作软件属于学习；熬夜后反应变慢不属于学习获得。"],
  "学习的规律": ["练习效果取决于间隔、反馈、材料组织和主动提取。学习曲线通常不是匀速上升，错误信息也能帮助调整。", "学习规律描述练习、反馈、强化、迁移和遗忘等因素对学习过程与结果的稳定影响。", "把三小时集中复习拆成多次间隔练习，往往更利于长期保持。"],
  "学习理论": ["行为主义强调刺激、反应与结果，认知理论强调内部表征与加工，建构主义强调学习者在情境中主动建构。", "学习理论是对学习发生的条件、机制和结果作出系统解释的理论体系。", "学生答对后获得反馈可用强化解释；理解概念结构则需要认知加工视角。"],
  "教学方法与学习": ["教学不是把信息搬给学生，而是设计目标、例子、练习和反馈，帮助学习者完成理解、提取和迁移。", "教学方法是教师为促进特定学习目标而组织内容、活动、练习和评价的方式。", "讲解后让学生用新情境解决问题，比只重复例题更能检查迁移。"],
  "个体发展概述": ["发展包含获得、保持与衰退，贯穿整个生命。年龄只是时间指标，解释变化还要考察成熟、经验与社会文化。", "个体发展是从受精到死亡，身体、认知和社会情绪等方面有规律的连续与阶段性变化。", "儿童词汇增长既与神经成熟有关，也取决于交流经验和教育环境。"],
  "身体、动作与感知觉发展": ["身体成熟为动作和感知探索提供条件，动作又改变个体获得信息的方式，多个系统彼此促进。", "身体、动作与感知觉发展是生理成熟与环境经验共同作用下的协调变化过程。", "婴儿学会爬行后能主动接近新物体，空间经验和照料者互动也随之改变。"],
  "语言与其他高级认知能力的发展": ["语言、记忆、思维和执行功能并非各自独立增长，它们在社会互动、教育和任务经验中相互支持。", "高级认知发展是表征、控制、推理和语言系统随成熟与经验发生的系统变化。", "儿童学会用语言给策略命名后，更容易计划和监控自己的解题步骤。"],
  "心理社会性发展": ["个体在依恋、自我、同伴、身份和社会角色中持续发展。每个阶段都有任务，但发展路径存在显著个体与文化差异。", "心理社会性发展是个体的自我、情绪、人格和社会关系在生命全程中的变化。", "青少年探索价值与职业方向，是形成自我同一性的重要过程，并不等同于故意叛逆。"],
};

function score(point: BetaKnowledgePoint, chapter: ChapterSeed, section: string): number {
  const haystack = `${point.title} ${point.coreConcept} ${point.keyPoints} ${(point.tags ?? []).join(" ")}`;
  const words = [section, chapter.title, ...(keywordGroups[section] ?? [])];
  return words.reduce((total, word) => total + (word.length >= 2 && haystack.includes(word) ? word.length : 0), 0);
}

function distribute(points: BetaKnowledgePoint[], chapterSeeds: ChapterSeed[]) {
  const flat = chapterSeeds.flatMap((chapter, chapterIndex) => chapter.sections.map((title, sectionIndex) => ({ chapter, chapterIndex, sectionIndex, title, points: [] as BetaKnowledgePoint[] })));
  for (const point of points) {
    const haystack = `${point.title} ${point.coreConcept} ${point.keyPoints} ${(point.tags ?? []).join(" ")}`;
    const chapterScores = chapterSeeds.map((chapter, chapterIndex) => ({ chapterIndex, score: haystack.includes(chapter.title) ? chapter.title.length : 0 })).sort((a, b) => b.score - a.score);
    const candidates = chapterScores[0].score > 0 ? flat.filter((section) => section.chapterIndex === chapterScores[0].chapterIndex) : flat;
    const ranked = candidates.map((section) => ({ section, score: score(point, section.chapter, section.title) })).sort((a, b) => b.score - a.score || Number(a.section.points.length > 0) - Number(b.section.points.length > 0) || a.section.points.length - b.section.points.length);
    const target = ranked[0].section;
    target.points.push(point);
  }
  return flat;
}

function authoredTeaching(title: string, points: BetaKnowledgePoint[]): BookSection["teaching"] {
  if (title === "心理学的研究对象") return {
    hook: "心理学不是只研究‘心里怎么想’，也不是只观察外在行为。今天先把这门学科究竟研究什么说清楚。",
    hookEn: "Psychology studies psychological processes together with behavior and their regularities.",
    learningObjectives: ["说明心理学研究什么", "解释什么是心理现象", "按心理过程与个性心理分类", "说明心理与行为的关系"],
    simpleExplanation: "想象你在考试前看到倒计时：你看见数字、想到结果、感到紧张、决定继续复习，并真的打开了书。知觉、思维、情绪和动机是内部心理活动；翻书、阅读等是可以观察的行为。心理学把二者联系起来研究，寻找它们在一定条件下发生和变化的规律。",
    formalDefinition: "心理学是研究心理现象及其发生、发展规律的科学。它既研究认知、情绪情感、意志等心理过程，也研究能力、气质、人格等个性心理，并借助行为表现推断和检验心理活动。",
    examples: ["同样收到低分，有人焦虑回避，有人分析错因并调整计划。分数是情境，感受与判断属于心理活动，之后是否复习属于行为；心理学研究这些环节如何相互影响。", "研究注意时，研究者不能直接看见‘注意’，会通过反应时、正确率、眼动或脑活动等可观察指标取得证据。"],
    counterExamples: ["把心理学等同于读心术，忽视可检验的研究方法。", "只记录一个行为就断定稳定人格，没有考虑情境与其他证据。"],
    comparison: ["心理是内部活动，行为是个体在一定情境中的外在反应；二者相关，但不能简单地一一对应。", "心理过程强调活动怎样发生，个性心理强调较稳定的个体差异。"],
    examTips: ["名词解释常要求指出心理学的研究对象与科学属性。", "简答题可按心理过程、个性心理、心理与行为关系三层组织。"],
    commonMistakes: ["把心理现象只理解为认知，漏掉情绪、意志和个性。", "认为行为可以毫无条件地直接代表内部心理。"],
    summary: "心理学研究心理现象及其规律，并通过行为与其他可观察证据理解心理。心理现象既包括动态的心理过程，也包括较稳定的个性心理。",
    feynmanPrompts: ["不看上面的内容。假设我是一个完全不懂心理学的人，请用自己的话告诉我：心理学研究的对象是什么？心理和行为有什么关系？"],
    requiredTerms: ["心理现象", "心理过程", "个性心理", "行为", "规律"],
    misconceptionRules: ["心理学不是读心术。", "行为是研究心理的重要证据，但单一行为不能直接等同于内部心理。"],
  };
  const primary = points[0];
  const note = sectionNotes[title];
  const concept = primary?.coreConcept ?? note?.[1] ?? `${title}是本节需要建立的核心知识框架。学习时要先确认对象、条件与证据，再判断结论能够解释到什么范围。`;
  const explanation = primary?.explanation ?? note?.[0] ?? `先把“${title}”当成一个要解决的问题：它描述什么现象、在什么条件下发生、我们如何观察和判断。把这三件事说清楚，再记术语会更牢。`;
  const example = primary?.examples?.[0] ?? note?.[2] ?? `遇到一个关于“${title}”的具体情境时，先指出观察对象和条件，再用本节概念解释结果，而不是只复述名词。`;
  const related = points.slice(1, 3).map((point) => point.title);
  const requiredTerms = [...new Set(points.flatMap((point) => [point.title, ...(point.coreConcepts ?? [])]).filter((item) => item.length >= 2 && item.length <= 12))].slice(0, 5);
  return {
    hook: `今天学习“${title}”。先知道它解释什么，再通过例子、辨析和复述把它变成能使用的知识。`,
    hookEn: `Learn ${title} by connecting the question, evidence, example and explanation.`,
    learningObjectives: [`用自己的话说明${title}的核心问题`, `用一个具体情境解释${title}`, `识别常见混淆并说明判断依据`],
    simpleExplanation: explanation,
    formalDefinition: primary?.definition ?? concept,
    examples: [example, ...points.slice(1, 2).flatMap((point) => point.examples?.slice(0, 1) ?? [])],
    counterExamples: [`只记住“${title}”这个名称，却说不出适用条件和证据，不等于真正掌握。`],
    comparison: primary?.comparisons?.length ? primary.comparisons : related.length ? [`与${related.join("、")}比较时，要分别说明对象、条件和结果。`] : ["把现象描述、理论解释和研究证据分开，避免在不同层次之间直接跳跃。"],
    examTips: points.flatMap((point) => point.examFocus ?? [point.keyPoints]).slice(0, 3),
    commonMistakes: points.flatMap((point) => point.commonMistakes ?? [point.pitfalls]).slice(0, 3),
    summary: points.length ? points.map((point) => `${point.title}：${point.coreConcept}`).join(" ") : `${title}需要同时掌握核心含义、成立条件、具体例子和解释边界。`,
    feynmanPrompts: [`不要看上面的内容。假设我是一个完全不懂心理学的人，请用自己的话解释“${title}”，并给出一个例子。`],
    requiredTerms: requiredTerms.length ? requiredTerms : [title],
    misconceptionRules: points.flatMap((point) => point.commonMistakes ?? [point.pitfalls]).slice(0, 2),
  };
}

export function buildPsychologyBookCatalog(state: BetaState): { curricula: BookCurriculum[]; chapters: BookChapter[]; sections: BookSection[] } {
  const curricula: BookCurriculum[] = [];
  const chapters: BookChapter[] = [];
  const sections: BookSection[] = [];
  for (const book of books) {
    curricula.push({ id: book.id, subjectId: "subject-psychology-312", title: book.title, titleEn: book.titleEn, version: PSYCHOLOGY_BOOKS_VERSION, examType: "312", description: `${book.author} · ${book.edition}。按教材章、节完成讲解、费曼复述、即时检测、背诵与复习。`, descriptionEn: `${book.author}, ${book.edition}. Guided lessons with recall, checks and review.`, author: book.author, edition: book.edition, status: book.status, sourceNote: book.sourceNote });
    const points = state.knowledgePoints.filter((point) => point.subjectId === "subject-psychology-312" && point.chapterId === book.sourceChapterId);
    const distributed = distribute(points, book.chapters);
    book.chapters.forEach((seed, chapterIndex) => {
      const chapterId = `${book.id}-chapter-${chapterIndex + 1}`;
      const verified = seed.verified === true;
      chapters.push({ id: chapterId, curriculumId: book.id, sourceChapterId: book.sourceChapterId, title: `第 ${chapterIndex + 1} 章 ${seed.title}`, titleEn: `Chapter ${chapterIndex + 1}: ${seed.title}`, order: chapterIndex + 1, description: verified ? "目录已核验；教学内容为系统原创讲解。" : "系统教学结构可直接学习；教材原目录待 PDF 校准。", descriptionEn: verified ? "Verified table of contents; original system teaching." : "Usable system lesson; textbook wording awaits PDF calibration.", chapterNumber: chapterIndex + 1, sourceStatus: verified ? "verified" : "needs_pdf_calibration" });
      seed.sections.forEach((title, sectionIndex) => {
        const assigned = distributed.find((item) => item.chapterIndex === chapterIndex && item.sectionIndex === sectionIndex)?.points ?? [];
        const sectionId = `${book.id}-chapter-${chapterIndex + 1}-section-${sectionIndex + 1}`;
        sections.push({ id: sectionId, chapterId, title: `第 ${sectionIndex + 1} 节 ${title}`, titleEn: `Section ${sectionIndex + 1}: ${title}`, order: sectionIndex + 1, sectionNumber: sectionIndex + 1, kind: "textbook", knowledgePointIds: assigned.map((point) => point.id), estimatedMinutes: Math.max(15, Math.min(35, 15 + assigned.length * 4)), sourceStatus: verified ? "verified" : "needs_pdf_calibration", sourceNote: verified ? "教材目录已核验；正文为系统原创教学。" : "小节名称或边界待教材 PDF 校准；正文为系统原创教学。", teaching: authoredTeaching(title, assigned) });
      });
      const chapterPoints = distributed.filter((item) => item.chapterIndex === chapterIndex).flatMap((item) => item.points);
      const map = chapterPoints.map((point) => point.title).join(" → ") || seed.sections.join(" → ");
      const reviewTitle = "章末整合：知识地图与总复述";
      sections.push({ id: `${chapterId}-review`, chapterId, title: reviewTitle, titleEn: "Chapter review: map, recall and practice", order: seed.sections.length + 1, sectionNumber: seed.sections.length + 1, kind: "chapter_review", knowledgePointIds: chapterPoints.map((point) => point.id), estimatedMinutes: 30, sourceStatus: verified ? "verified" : "needs_pdf_calibration", sourceNote: "系统原创章末整合课，不是教材原文或教材原题。", teaching: {
        hook: `完成第 ${chapterIndex + 1} 章后，用知识地图把各节连起来，再做一次不看材料的总复述。`, hookEn: "Connect the chapter into one knowledge map, then recall it without notes.",
        learningObjectives: ["说出本章知识结构", "解释核心概念之间的关系", "用练习检查薄弱点", "把必背内容加入复习"],
        simpleExplanation: `本章知识地图：${map}。先沿着这条路径回忆每一节解决的问题，再补上概念之间的因果、条件或对比关系。`,
        formalDefinition: `章末复习不是重复阅读，而是用知识地图组织信息，通过主动复述和练习取得掌握证据。`,
        examples: [`合上材料，从第一个节点开始，尝试用“因为—所以—但是”把相邻知识连接起来；卡住的位置就是下一轮复习重点。`],
        counterExamples: ["只浏览章节标题并产生熟悉感，不能证明能够提取和应用。"], comparison: ["知识地图负责结构，费曼复述检查理解，客观题与主观题检查辨析和表达。"],
        examTips: ["先用章节框架定位题目，再调用具体概念和条件作答。", "错题应回到对应知识节点，而不是只记选项。"],
        commonMistakes: ["复习时平均用力，忽略错题、复述缺漏和到期内容。"], summary: `本章结构：${map}。`,
        feynmanPrompts: [`不看材料，用三分钟讲清第 ${chapterIndex + 1} 章的知识地图、核心关系和一个容易混淆的地方。`],
        requiredTerms: chapterPoints.slice(0, 5).map((point) => point.title).length ? chapterPoints.slice(0, 5).map((point) => point.title) : [seed.title],
        misconceptionRules: ["熟悉感不等于能主动提取。", "章节复习必须回到具体证据：复述、练习和错题。"],
      } });
    });
  }
  return { curricula, chapters, sections };
}

export function findPsychologyBookSectionByKnowledgePoint(state: BetaState, knowledgePointId: string) {
  return buildPsychologyBookCatalog(state).sections.find((section) => section.knowledgePointIds.includes(knowledgePointId));
}

export function psychologyBookCoverage(state: BetaState) {
  const catalog = buildPsychologyBookCatalog(state);
  return catalog.curricula.map((book) => {
    const bookChapters = catalog.chapters.filter((chapter) => chapter.curriculumId === book.id);
    const bookSections = catalog.sections.filter((section) => bookChapters.some((chapter) => chapter.id === section.chapterId) && section.kind !== "chapter_review");
    const pointIds = new Set(bookSections.flatMap((section) => section.knowledgePointIds));
    const dedicatedQuestions = bookSections.filter((section) => state.questions.some((question) => question.knowledgePointId && section.knowledgePointIds.includes(question.knowledgePointId))).length;
    const dedicatedRecitations = bookSections.filter((section) => state.recitations.some((item) => item.knowledgePointId && section.knowledgePointIds.includes(item.knowledgePointId))).length;
    const fallbackQuestionsAvailable = state.questions.filter((question) => question.subjectId === book.subjectId).length >= 2;
    return { curriculumId: book.id, title: book.title, chapters: bookChapters.length, sections: bookSections.length, mappedKnowledgePoints: pointIds.size, uncoveredSections: bookSections.filter((section) => !section.teaching).length, contentCoverage: bookSections.length ? Math.round(bookSections.filter((section) => section.teaching).length / bookSections.length * 100) : 0, questionCoverage: fallbackQuestionsAvailable ? 100 : 0, dedicatedQuestionCoverage: bookSections.length ? Math.round(dedicatedQuestions / bookSections.length * 100) : 0, recitationCoverage: 100, dedicatedRecitationCoverage: bookSections.length ? Math.round(dedicatedRecitations / bookSections.length * 100) : 0, status: book.status };
  });
}
