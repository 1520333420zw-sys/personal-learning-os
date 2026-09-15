# Personal Learning OS Architecture Roadmap

本文件记录已经确认、但尚未进入实现阶段的产品与领域架构方向。当前实现仍停留在应用基础阶段。

## Politics

Politics 是与 312 Psychology 并列的独立学习科目，不属于 312 Psychology 的子模块。

后续 Politics 模块需要支持：

- 政治知识体系、章节与知识点
- 背诵与记忆
- 每日复习
- 题库与历年真题
- 错题本与收藏题
- 错题重做
- 模拟卷与模拟考试
- 学习进度与正确率
- 薄弱知识点分析
- 时政专区
- 实时时政新闻
- 新闻来源、发布时间与原文链接
- 时政考点整理
- 时政与知识点关联
- 时政练习题

实时时政新闻属于未来数据接入阶段。当前不连接 News API 或 RSS，也不抓取新闻内容。未来接入必须保留来源、发布时间和原文链接。

## Shared Question Bank

Question Bank 是跨科目的通用领域能力。Politics、312 Psychology，以及未来适合练题的其他学习科目都应复用同一套题库模型和作答流程。

长期领域方向包括：

- Question
- QuestionAttempt
- QuestionBank
- ExamPaper
- Mistake
- Favorite / Bookmark
- Review

题目至少需要表达：

- subject
- chapter
- knowledgePoint
- questionType
- difficulty
- source
- year
- stem
- options
- answer
- explanation
- attempt history
- correct / incorrect
- favorite
- mistake status

当前阶段只确认共享边界，不实现数据库、完整领域模型、题库逻辑或答题状态。

## Unified Learning and Review Loop

长期统一学习闭环：

    Learn
    → Recite / Recall
    → Practice
    → Mistake Review
    → Scheduled Review
    → Mock Exam
    → Progress Analysis

Study Plan 和 Home 后续应从统一的任务、复习和学习记录中聚合：

- 今日学习任务
- 今日复习任务
- Vocabulary review
- Recitation review
- Question mistakes / review
- Knowledge point review
- 正确率
- 薄弱知识点
- 学习进度

这些聚合必须以共享领域记录为数据来源，避免由各页面分别维护重复统计。具体领域模型、Repository 和统计实现留待相应开发阶段确定。

## Phase 2A Foundation

Phase 2A 已建立以下可替换的数据边界：

- EntityBase 与受控 StudyTargetRef
- Subject、Chapter、KnowledgePoint
- Plan、Task
- StudySession 与独立的 PomodoroSession
- 跨模块 Review
- Question、QuestionAttempt、QuestionBank、ExamPaper
- 面向具体查询的 Repository contracts
- 与 UI 分离的 fixtures 和 Mock Repository implementations
- 集中提供今日任务、到期复习、近期学习记录和单日学习时长的 LearningQueryService

V1 数据组合入口使用 Mock repositories。未来接入 API 或数据库时，应替换 composition 层中的 repository implementation，而不是修改 UI 或领域类型。业务数据不以 localStorage 作为事实来源。
