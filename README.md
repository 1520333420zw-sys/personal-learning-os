# Personal Learning OS

这是一个私人学习与成长 Web App。

详细产品需求如下：

（下面放完整版需求）
# Personal Learning OS — 产品总需求

我要从零开发一个属于自己的 Personal Learning OS。

这是一个长期使用的私人学习与成长 Web App。

它不是普通个人网站，也不是单纯的学习记录/打卡系统。

核心目标是：

用户可以直接在网站里：

- 制定学习计划
- 学习考研 312 心理学专业基础综合
- 背单词
- 背书 / 背诵学习材料
- 阅读英文外刊
- 阅读课外书
- 获取全球热点新闻
- 通过新闻学习英语和世界知识
- 做学习笔记
- 建立个人知识库
- 使用番茄钟专注学习
- 管理健康
- 管理财务
- 记录个人成长

长期目标是：

计划
↓
学习
↓
阅读
↓
背诵 / 做题
↓
记录
↓
复习
↓
知识沉淀
↓
数据反馈

最终形成完整的个人学习系统。

==================================================
1. 技术要求
==================================================

使用：

- Next.js
- TypeScript
- Tailwind CSS

请选择当前稳定、主流、适合长期维护的实现方案。

代码要求：

- 结构清晰
- TypeScript 类型完整
- 组件职责明确
- 避免过度工程化
- 初学者也能够逐渐理解
- Desktop / Tablet / Mobile responsive
- 为未来数据库、Authentication、API、PWA做好架构准备

当前阶段暂时不要：

- 数据库
- 用户登录
- 支付
- AI API
- 新闻 API
- 银行账户连接
- 复杂后端

第一阶段使用：

TypeScript types/interfaces + mock data

但是：

UI state 和 persistent domain data 必须明确分离。

不要把未来需要同步的重要数据设计成只能存在：

- React component state
- localStorage
- 单个设备浏览器

localStorage 只能用于临时 UI preference/cache。

==================================================
2. 产品导航
==================================================

HOME
- Home

STUDY
- Plan
- 312 Psychology
- Vocabulary
- Recitation
- Reading
- Books
- Focus

EXPLORE
- World

KNOWLEDGE
- Knowledge

LIFE
- Health
- Finance
- Growth

SYSTEM
- Language
- Settings

==================================================
3. Home Dashboard
==================================================

Home 不是传统个人介绍页面。

它是每天打开网站后的学习控制中心。

需要包含：

1. Greeting

例如：

Good morning.
今天也向目标靠近一点。

显示：
- 日期
- 简短问候

2. Today's Focus

显示今日计划，例如：

312 Psychology     2h
Vocabulary         30m
Reading            40m

显示完成进度。

3. Continue Learning

快速继续：

- 上一次 312 学习
- 上一次 Vocabulary
- 上一次 Reading
- 上一次 Books
- 上一次 Recitation

4. Focus Today

显示：

- 今日总专注时间
- Pomodoro 数量
- 各模块学习时间

例如：

312 Psychology    2h 15m
Vocabulary          45m
Reading              1h
Books               30m

Total              4h 30m
Pomodoros               9

5. Today in the World

显示当天重要全球新闻入口：

- Global
- Business
- Technology
- Science
- Culture

第一阶段使用 mock data。

6. Today's Progress

例如：

Study Time
Vocabulary
Reading
Review
Tasks

==================================================
4. Plan — 学习计划
==================================================

用于：

- Daily Plan
- Weekly Plan
- Monthly Plan
- Long-term Goals

任务可以属于：

- 312 Psychology
- Vocabulary
- Recitation
- Reading
- Books
- Other

任务未来需要支持：

- priority
- estimated duration
- actual duration
- completion
- due date
- related subject
- related chapter
- related knowledge point

==================================================
5. 312 Psychology
==================================================

这是考研 312 心理学专业基础综合的专门学习空间。

不要把它设计成简单资料列表。

学习逻辑：

科目
↓
章节
↓
知识点
↓
学习
↓
理解
↓
背诵
↓
做题
↓
错题
↓
复习
↓
掌握

需要为以下功能预留：

- Subjects
- Chapters
- Knowledge Points
- Notes
- Recitation
- Flashcards
- Practice Questions
- Mistakes
- Review Plan
- Mastery
- Study Time
- Progress

312 首页显示：

- 考试倒计时（日期未来可由用户设置）
- 今日学习时间
- 总学习进度
- 各科进度
- 今日任务
- 待复习内容

312 内容必须能够与：

- Plan
- Recitation
- Knowledge
- Focus

互通。

例如：

312
↓
某科目
↓
某章节
↓
某知识点
↓
Add to Recitation
↓
Recitation
↓
Review

以及：

312 Notes
↓
Knowledge

Practice Question
↓
回答错误
↓
Mistakes
↓
Review

第一阶段：

只建立产品结构和 UI。

不要自行生成大量真实 312 学习内容。

只能使用少量、明确标记为：

Demo / Mock

的示例数据。

==================================================
6. Vocabulary — 背单词
==================================================

这必须是一个真正可以学习的模块，
而不是单词列表。

核心学习界面：

显示：

- Word
- IPA
- Audio button
- Meaning
- Example
- Progress

用户回答：

- Again
- Hard
- Good
- Easy

未来需要支持：

- New Words
- Review
- Spelling
- EN → CN
- CN → EN
- Wrong Words
- Favorites
- Daily Goal
- Streak
- Mastery
- Review Scheduling

每个单词需要记录来源：

- Vocabulary Book
- Reading
- World
- Books
- Manual

例如：

World News
↓
点击陌生单词
↓
Add to Vocabulary
↓
之后复习

第一阶段：

实现高质量学习 UI + mock learning flow。

不要实现复杂的间隔重复算法，
但数据模型需要为未来 SRS 做准备。

==================================================
7. Recitation — 背书
==================================================

用户未来可以创建自己的背诵材料。

流程：

创建内容
↓
拆分 Section
↓
学习
↓
隐藏内容
↓
主动回忆
↓
显示答案
↓
自我评分
↓
安排复习

评分：

- Again
- Hard
- Good
- Easy

需要为以下功能预留：

- Text segmentation
- Cloze
- Hide / Reveal
- Flashcard
- Mastery
- Review Scheduling

可以与：

312 Psychology

互通。

例如：

312 Knowledge Point
↓
Add to Recitation
↓
Recitation Review

==================================================
8. Reading — 外刊阅读
==================================================

这是一个学习型英文阅读器。

阅读页面要求尽量沉浸、简洁。

支持：

- English article
- Reading progress
- Select word
- Dictionary popup
- Highlight
- Notes
- Favorite sentence
- Add word to Vocabulary
- Save note to Knowledge

点击英文单词后未来显示：

Word
IPA
Meaning
Example

按钮：

Add to Vocabulary

形成：

Reading
↓
Unknown Word
↓
Vocabulary
↓
Review

以及：

Reading
↓
Highlight / Note
↓
Knowledge

第一阶段：

使用原创 mock article。

不要复制受版权保护的真实新闻/外刊全文。

==================================================
9. Books — 课外书
==================================================

建立个人书架。

页面包括：

- Currently Reading
- My Library
- Finished
- Reading Progress
- Highlights
- Notes

未来希望支持用户合法拥有或有权使用的：

- EPUB
- TXT
- PDF

阅读器未来支持：

- Table of Contents
- Progress
- Highlight
- Notes
- Vocabulary
- Bookmark
- Reading Time

形成：

Books
↓
Unknown Words
↓
Vocabulary

Books
↓
Highlights / Notes
↓
Knowledge

第一阶段：

只建立 Library UI + Demo Reader。

不要现在实现复杂 EPUB/PDF parser。

==================================================
10. World — 全球热点
==================================================

World 不只是新闻列表。

定位：

Global News + English Reading + Knowledge Learning

分类：

- Top
- Global
- Business
- Technology
- Science
- Culture

新闻卡片未来需要显示：

- Headline
- Summary
- Source
- Published Time
- Category
- Language
- Original Link

未来实时新闻必须来自可靠新闻 API / RSS / 合规来源。

必须保留：

- source attribution
- published time
- original article link

不要复制受版权保护的完整新闻文章正文。

第一阶段：

只使用 mock news data。

进入英文新闻学习模式后：

支持：

- Dictionary
- Add to Vocabulary
- Highlight
- Note
- Save to Knowledge

形成：

World
↓
English News
↓
Unknown Word
↓
Vocabulary

以及：

World
↓
Important Concept / Note
↓
Knowledge

==================================================
11. Knowledge — 个人知识库
==================================================

所有学习最终应该逐渐汇聚到 Knowledge。

来源可以包括：

- 312
- Reading
- Books
- World
- Manual Notes
- Finance
- Health

Knowledge 首页：

- Search
- Categories
- Recent Notes
- Favorites
- Review

知识条目未来需要支持：

- title
- content
- category
- tags
- source
- related notes
- related vocabulary
- createdAt
- updatedAt
- review status

目标：

让学习内容不散落在不同模块。

==================================================
12. Focus — 番茄钟
==================================================

增加全站 Focus / Pomodoro 系统。

默认：

25 min Focus
5 min Break

支持：

- 自定义专注时间
- 自定义休息时间
- Pause
- Resume
- Reset
- Long Break
- 今日 Pomodoro 数量
- 今日累计 Focus Time

开始 Session 时选择：

- 312 Psychology
- Vocabulary
- Recitation
- Reading
- Books
- Other

如果选择：

312 Psychology

未来继续选择：

Subject
↓
Chapter
↓
Knowledge Point

Focus Timer 必须是 Global Component。

用户从：

312 → Vocabulary → Reading

切换页面时，

Timer 不应该被重置。

==================================================
13. Focus 跨设备架构
==================================================

未来 Pomodoro 必须支持：

电脑开始
↓
手机继续查看
↓
iPad继续

因此不要只存：

remainingSeconds

数据模型需要考虑：

- id
- userId
- startedAt
- endsAt
- pausedAt
- duration
- status
- studyCategory
- subjectId
- chapterId
- knowledgePointId

客户端未来根据：

server time + endsAt

计算剩余时间。

第一阶段不需要真正云同步，
但架构不能阻碍未来实现。

==================================================
14. Health
==================================================

第一阶段做轻量 UI。

未来用于：

- Exercise
- Sleep
- Diet
- Weight
- Habits
- Trends

Home 后续可以显示简单 Health summary。

==================================================
15. Finance
==================================================

第一阶段：

只做私人财务管理和财务学习 UI。

未来包括：

- Income
- Expense
- Budget
- Savings
- Financial Goals
- Finance Knowledge

第一阶段：

不要连接银行账户。
不要接支付。
不要处理真实金融账户。

==================================================
16. Growth
==================================================

用于长期成长记录。

包括：

- Daily Journal
- Weekly Review
- Monthly Review
- Goals
- Growth Timeline

未来可以生成：

Monthly Growth Summary

例如：

Study
Reading
Books
Vocabulary
Health
Savings
Journal

==================================================
17. 中文 / English
==================================================

网站支持：

中文
English

UI Language 和 Learning Language 需要概念分离。

例如：

Interface Language:
中文

Learning Language:
English

英文文章不要因为 UI 切换中文而自动变成中文。

架构需要为真正 i18n 做准备。

==================================================
18. Design System
==================================================

视觉风格：

Korean Minimal / 韩系极简

目标感觉：

“韩系极简学习手帐 + 高质量数字阅读空间”

使用：

- Cream White
- Warm Beige
- Light Gray
- Muted neutral colors
- Large whitespace
- Rounded cards
- Thin borders
- Very subtle shadows
- Clean typography
- Natural micro animations

要求：

- 安静
- 高级
- 精致
- 克制
- 阅读友好
- 长时间使用不疲劳

不要：

- 企业后台管理系统风格
- 大面积蓝色
- Neon
- 大量渐变
- 过度阴影
- 过度动画
- 游戏化儿童学习软件风格
- 页面塞满数据

==================================================
19. Multi-device
==================================================

必须从第一阶段考虑：

- Mobile
- Tablet / iPad
- Desktop / Laptop

不要简单把 Desktop 页面缩小。

Desktop：

适合：

- 完整 Sidebar
- 312 学习
- Knowledge
- Data visualization
- Multi-column Reading

Tablet / iPad：

重点优化：

- Reading
- Books
- 312
- Notes
- Split View

Mobile：

重点优化：

- Vocabulary
- Pomodoro
- Today's Plan
- Quick Notes
- World
- Review

核心功能必须 responsive。

==================================================
20. Future Cloud Sync
==================================================

未来用户登录同一账户后：

手机
iPad
电脑

数据需要自动同步。

需要同步：

- Plans
- Tasks
- 312 progress
- Vocabulary
- Review status
- Recitation
- Reading progress
- Book progress
- Highlights
- Notes
- Knowledge
- Mistakes
- Favorites
- Focus Sessions
- Study Time
- Health
- Finance
- Growth

第一阶段虽然没有数据库，

但 Domain Model 必须按照：

User + Cloud Database + Multi-device Sync

进行设计。

==================================================
21. PWA
==================================================

未来希望支持 PWA。

目标：

iPhone / Android
→ Add to Home Screen

iPad
→ Add to Home Screen

Desktop
→ Install Web App

当前阶段：

不需要完整实现 Offline Sync。

但：

项目架构不能阻碍未来 PWA。

==================================================
22. 数据关系
==================================================

请重点考虑这些 Domain Models：

User

Plan
Task

Subject
Chapter
KnowledgePoint

VocabularyItem
VocabularyReview

RecitationMaterial
RecitationSection
RecitationReview

Article
ReadingProgress

Book
BookProgress

Highlight
Note

NewsItem

KnowledgeEntry

Question
Mistake

StudySession
PomodoroSession

HealthRecord

FinanceRecord

JournalEntry
Goal

请分析这些实体之间合理的关系。

不要为了“看起来专业”而过度复杂化。

==================================================
23. 第一阶段开发范围
==================================================

第一阶段目标：

“完整产品骨架 + 高质量 UI + 正确的数据架构”

创建：

- Global Layout
- Responsive Navigation
- Home
- Plan
- 312 Psychology
- Vocabulary
- Recitation
- Reading
- Books
- Focus
- World
- Knowledge
- Health
- Finance
- Growth
- Settings

使用：

Mock Data

但是：

mock data 必须和 UI components 分离。

==================================================
24. 当前禁止实现
==================================================

第一阶段不要实现：

- Authentication
- Database
- Payments
- Banking
- AI API
- Real News API
- Complex SRS
- EPUB parser
- PDF parser
- Offline synchronization
- Push notifications

这些以后逐阶段加入。

==================================================
25. 开发方式
==================================================

不要一次性完成整个项目。

请严格分阶段开发。

现在是 Architecture Phase。

第一步只做分析。

请先输出：

1. 推荐的项目目录结构
2. 页面 Route 设计
3. Component Architecture
4. Domain Model 初稿
5. Mock Data Architecture
6. Responsive Strategy
7. i18n Strategy
8. Focus Timer Architecture
9. Future Cloud Sync Strategy
10. Future PWA Strategy
11. 你认为目前需求存在的技术风险
12. 推荐开发顺序

暂时不要创建或修改任何代码。

等我确认 Architecture 后，
再进入 Phase 1 开发。
