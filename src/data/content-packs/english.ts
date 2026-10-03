import type { BetaEnglishContent } from "@/domain/beta";

export const ENGLISH_METHODS_VERSION="2026.10-english-methods-1";
type Theme=[string,string,string,string,string,string,string];
const themes:Theme[]=[
  ["public libraries","公共图书馆","provide equal access to reliable information","让公众平等获取可靠信息","communities invest in trained staff","社区投入专业人员","access; reliable; invest"],
  ["scientific models","科学模型","simplify selected features of reality","简化现实中的特定特征","researchers state their assumptions clearly","研究者清楚说明假设","model; feature; assumption"],
  ["urban green spaces","城市绿地","reduce heat and support daily exercise","缓解高温并支持日常锻炼","planners connect them to residential areas","规划者将其与居住区连通","urban; reduce; residential"],
  ["historical evidence","历史证据","supports interpretations rather than speaking for itself","支持历史解释而不会自行给出结论","readers examine authorship and context","读者考察作者和语境","evidence; interpretation; authorship"],
  ["digital platforms","数字平台","shape how information reaches an audience","影响信息如何到达受众","users understand recommendation systems","用户理解推荐机制","platform; audience; recommendation"],
  ["renewable energy","可再生能源","can lower long-term carbon emissions","能够降低长期碳排放","electric grids adapt to variable supply","电网适应波动的供给","renewable; emission; variable"],
  ["medical screening","医学筛查","identifies people who may need further examination","识别可能需要进一步检查的人","clinicians explain false positives and false negatives","临床人员解释假阳性和假阴性","screening; identify; false positive"],
  ["language learning","语言学习","improves when retrieval is spaced over time","在间隔提取时效果更好","learners use feedback to correct errors","学习者利用反馈纠正错误","retrieval; spaced; feedback"],
  ["economic indicators","经济指标","summarize only part of social well-being","只能概括社会福祉的一部分","analysts compare several measures","分析者比较多种指标","indicator; summarize; well-being"],
  ["biodiversity","生物多样性","helps ecosystems respond to disturbance","帮助生态系统应对干扰","habitats remain sufficiently connected","栖息地保持足够连通","biodiversity; ecosystem; disturbance"],
  ["open-source software","开源软件","allows communities to inspect and improve code","允许社群检查并改进代码","projects maintain clear governance","项目保持清晰治理","inspect; maintain; governance"],
  ["sleep routines","睡眠规律","influence attention and memory the following day","影响次日的注意与记忆","people keep schedules reasonably consistent","人们保持相对稳定的作息","routine; influence; consistent"],
  ["statistical significance","统计显著性","does not by itself show practical importance","本身不能说明实践重要性","reports include effect sizes and uncertainty","报告同时给出效应量与不确定性","significance; practical; uncertainty"],
  ["museum collections","博物馆藏品","gain meaning through documentation and interpretation","通过记录与解释获得意义","institutions preserve their provenance","机构保存其来源记录","collection; documentation; provenance"],
  ["remote work","远程工作","changes coordination rather than eliminating it","改变协作方式而非消除协作","teams make responsibilities visible","团队明确展示责任分工","remote; coordination; responsibility"],
  ["early childhood education","早期教育","supports development through responsive interaction","通过有回应的互动支持发展","activities match children's changing abilities","活动匹配儿童不断变化的能力","responsive; interaction; ability"],
  ["financial diversification","金融分散化","reduces some asset-specific risk","降低部分资产特有风险","investors consider correlations among assets","投资者考虑资产间相关性","diversification; asset; correlation"],
  ["ethical decisions","伦理决策","require facts and values to be examined separately","要求分别审视事实与价值","people compare consequences and duties","人们比较后果与义务","ethical; consequence; duty"],
  ["water management","水资源管理","must balance supply, ecosystems, and future demand","必须平衡供给、生态系统与未来需求","policies reflect local conditions","政策反映当地条件","balance; demand; policy"],
  ["peer review","同行评议","can identify weaknesses before research is published","能在研究发表前识别不足","reviewers disclose relevant conflicts","评审者披露相关利益冲突","peer review; weakness; disclose"],
  ["mathematical proofs","数学证明","show why a conclusion follows from stated assumptions","说明结论为何从既定假设推出","each inference is justified","每一步推理都有依据","proof; conclusion; inference"],
  ["public transport","公共交通","works best as a connected network","作为连通网络时运行效果最好","routes match patterns of daily travel","线路匹配日常出行模式","transport; network; route"],
  ["cultural translation","文化翻译","requires attention to context as well as words","既关注词语也关注语境","translators explain choices that have no exact equivalent","译者说明缺少精确对应时的选择","translation; context; equivalent"],
  ["data privacy","数据隐私","depends on limiting collection as well as securing storage","既依赖限制收集也依赖安全存储","organizations define a clear purpose","机构明确数据用途","privacy; collection; storage"],
  ["critical reading","批判性阅读","asks how a claim is supported and qualified","追问主张如何得到支持并受到限定","readers distinguish evidence from assertion","读者区分证据与断言","critical; qualify; assertion"],
];
const frames=[
  (t:Theme)=>[`Although ${t[0]} ${t[2]}, their benefits are greatest when ${t[4]}.`,`尽管${t[1]}${t[3]}，但当${t[5]}时，其作用最充分。`,`their benefits are greatest`,`Although 引导让步状语从句；when 引导条件状语从句`],
  (t:Theme)=>[`Because ${t[0]} ${t[2]}, policymakers should ask whether ${t[4]}.`,`由于${t[1]}${t[3]}，决策者应追问是否${t[5]}。`,`policymakers should ask`,`Because 引导原因状语从句；whether 引导宾语从句`],
  (t:Theme)=>[`What makes ${t[0]} valuable is not simply that they ${t[2]}, but that ${t[4]}.`,`使${t[1]}具有价值的，不只是它们${t[3]}，还在于${t[5]}。`,`What ... is not simply ..., but ...`,`What 引导主语从句；两个 that 从句构成并列对照`],
  (t:Theme)=>[`Only when ${t[4]} can ${t[0]} fully ${t[2]}.`,`只有当${t[5]}时，${t[1]}才能充分${t[3]}。`,`can ${t[0]} fully ...`,`Only when 位于句首触发主句部分倒装`],
];

const methods:Record<Exclude<BetaEnglishContent["kind"],"sentence">,string[]>={
  grammar:["句子主干与修饰成分|先找谓语和核心主语，再判断介词短语、分词和从句修饰谁。","定语从句|识别先行词、关系词在从句中的成分以及限制性差别。","状语从句|按时间、原因、条件、让步和结果判断逻辑，不只翻译连接词。","名词性从句|主语、宾语、表语和同位语从句在句中承担名词功能。","非谓语结构|根据逻辑主语、时间关系和主动被动选择不定式、动名词或分词。","倒装|否定或限制性成分前置时检查助动词与主语顺序。","插入与同位语|暂时移除插入成分寻找主干，再恢复其补充说明功能。","并列与平行|核对连词两侧的语法层级和形式是否对应。","指代关系|按语法一致、语义合理和篇章焦点确定代词所指。","省略与替代|还原被省略成分，但避免重复翻译已经由替代词承接的信息。"],
  comprehension:["主旨题|概括全文反复推进的问题和作者结论，排除只覆盖局部细节的选项。","细节题|回到定位句及其前后逻辑，判断选项是否偷换主体、范围或程度。","推断题|只推出文本证据必然或高度支持的结论，不补入常识性猜测。","词义题|结合搭配、指代和上下文功能判断语境义，不机械套最熟悉词义。","态度题|从评价词、让步转折和结论语气判断态度强度。","例证题|先找例子服务的观点，例子内容本身通常不是答案重点。","段落关系|识别提出问题、解释、对比、举例和结论等功能。","干扰项识别|重点检查绝对化、因果倒置、范围扩大和无中生有。","长难句定位|先读题干关键词，再用同义改写定位，不依赖逐词匹配。","阅读流程|先建立文章结构，再精读证据句，最后逐项验证而不是凭印象选择。"],
  translation:["定语从句翻译|先确定修饰对象，再根据长度和逻辑选择前置或拆分。","状语从句翻译|先还原时间、原因、条件或让步关系，再调整汉语语序。","名词性从句翻译|判断从句在主句中的功能，避免把形式主语当真实内容。","倒装结构翻译|恢复正常语序后确认强调信息，再组织自然汉语。","插入语翻译|先完成主干，再把评论或来源说明放到合适位置。","被动语态翻译|根据汉语习惯选择被动表达、无主句或转换施受关系。","并列结构翻译|确认并列层级和共享成分，保持逻辑对称。","指代翻译|明确代词指向，必要时在汉语中复现名词避免歧义。","抽象名词翻译|结合搭配把抽象名词转换为更自然的动词或分句。","长句切分|以逻辑关系和信息焦点为界切分，而不是按标点机械断句。"],
  writing:["应用文任务审题|确认身份、对象、目的和必须覆盖的信息点。","应用文结构|用开头说明目的，主体完成任务，结尾提出期待或感谢。","图画作文描述|只描述支持主题的关键画面，避免无关细节堆积。","图表作文描述|选择趋势、差异和转折，用数据支持而不逐项抄写。","中心论点|写出可论证且范围清楚的观点，避免只有宽泛口号。","因果论证|区分原因、条件和结果，避免把相关性直接写成因果。","对比论证|保持比较对象、维度和时间范围一致。","举例论证|说明例子为何支持论点，而不让故事替代分析。","建议表达|给出对象明确、可执行且与问题原因对应的建议。","结尾收束|重申核心判断并指出行动方向，不引入全新论点。"],
};

export function createEnglishSystemContent():BetaEnglishContent[]{
  const now=new Date().toISOString();const base={ownerId:"local-owner",createdAt:now,updatedAt:now,examType:"english1" as const,note:"",mastery:"new" as const,favorite:false};
  const sentences=themes.flatMap((theme,themeIndex)=>frames.map((make,frameIndex)=>{const [sentence,translation,main,grammar]=make(theme);return{...base,id:`system-english-sentence-${themeIndex+1}-${frameIndex+1}`,kind:"sentence" as const,title:`长难句 ${themeIndex*4+frameIndex+1}`,content:`Sentence\n${sentence}\n\nTranslation\n${translation}\n\nMain clause\n${main}\n\nClause structure\n${grammar}\n\nVocabulary\n${theme[6]}\n\nCommon mistake\n先找主干和逻辑关系，不按英文词序逐词翻译。`};}));
  const study=Object.entries(methods).flatMap(([kind,items])=>items.map((entry,index)=>{const[title,content]=entry.split("|");return{...base,id:`system-english-${kind}-${index+1}`,kind:kind as BetaEnglishContent["kind"],title,content,writingType:kind==="writing"?"template" as const:undefined};}));
  return [...sentences,...study];
}
