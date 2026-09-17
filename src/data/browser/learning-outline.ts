import type { BetaUnit } from "@/domain/beta";

// An original navigation outline, not a claim to reproduce an official syllabus or textbook.
const outline: Record<string, [string, string][]> = {
  "psych-general": [["心理学概述","Introduction"],["心理的神经生理机制","Biological bases"],["感觉","Sensation"],["知觉","Perception"],["意识与注意","Consciousness and attention"],["记忆","Memory"],["思维与语言","Thinking and language"],["动机与情绪","Motivation and emotion"],["能力与人格","Ability and personality"]],
  "psych-social": [["社会认知","Social cognition"],["社会态度","Social attitudes"],["人际关系","Interpersonal relations"],["社会影响","Social influence"],["群体过程","Group processes"],["文化与社会行为","Culture and behavior"]],
  "psych-development": [["发展心理学概述","Introduction"],["发展理论","Developmental theories"],["婴儿期","Infancy"],["幼儿期","Early childhood"],["童年期","Childhood"],["青少年期","Adolescence"],["成年期与老年期","Adulthood and aging"]],
  "psych-education": [["教育心理学概述","Introduction"],["学习理论","Learning theories"],["学习动机","Learning motivation"],["知识与技能学习","Knowledge and skills"],["学习策略","Learning strategies"],["教学与评价","Teaching and assessment"]],
  "psych-experimental": [["实验设计基础","Experimental design"],["变量与控制","Variables and control"],["反应时","Reaction time"],["心理物理法","Psychophysics"],["知觉与注意实验","Perception and attention experiments"],["记忆与思维实验","Memory and thinking experiments"]],
  "psych-statistics": [["描述统计","Descriptive statistics"],["概率与分布","Probability and distributions"],["参数估计","Estimation"],["假设检验","Hypothesis testing"],["相关与回归","Correlation and regression"],["方差分析","Analysis of variance"],["非参数检验","Nonparametric tests"]],
  "psych-measurement": [["测量基础","Measurement basics"],["信度","Reliability"],["效度","Validity"],["项目分析","Item analysis"],["常模与分数解释","Norms and scores"],["测验编制与使用","Test development and use"]],
  "politics-marxism": [["马克思主义哲学","Marxist philosophy"],["唯物论","Materialism"],["辩证法","Dialectics"],["认识论","Epistemology"],["历史唯物主义","Historical materialism"],["政治经济学","Political economy"],["科学社会主义","Scientific socialism"]],
  "politics-theory": [["理论体系导论","Introduction"],["新民主主义革命理论","New democratic revolution"],["社会主义改造理论","Socialist transformation"],["社会主义建设探索","Socialist construction"],["中国特色社会主义理论体系","Socialism with Chinese characteristics"]],
  "politics-xi": [["思想体系概述","Overview"],["现代化建设","Modernization"],["经济建设","Economic development"],["政治建设","Political development"],["文化建设","Cultural development"],["社会建设","Social development"],["生态文明建设","Ecological civilization"]],
  "politics-history": [["近代中国与民族危机","Modern China and crisis"],["救亡探索","Early reform efforts"],["辛亥革命","1911 Revolution"],["新民主主义革命","New democratic revolution"],["社会主义革命和建设","Socialist revolution and development"],["改革开放以来","Reform era"]],
  "politics-ethics": [["人生观与价值观","Life and values"],["理想信念","Ideals and convictions"],["道德建设","Ethics"],["法治思想","Rule of law"],["权利与义务","Rights and duties"]],
  "politics-current": [["形势与政策","Current policies"],["国内时事","Domestic affairs"],["国际时事","International affairs"],["时政与理论关联","Linking events and theory"]],
};

export function createOutlineUnits(): BetaUnit[] {
  const now = new Date().toISOString();
  return Object.entries(outline).flatMap(([chapterId, names]) => names.map(([title, titleEn], index) => ({
    id: `unit-${chapterId}-${index + 1}`, ownerId: "local-owner", createdAt: now, updatedAt: now,
    subjectId: chapterId.startsWith("psych-") ? "subject-psychology-312" : "subject-politics",
    chapterId, title, titleEn, order: index + 1,
  })));
}
