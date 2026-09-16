import type { Locale } from "./config";

const zh = {
  loading: "正在读取本地数据…", add: "新增", edit: "编辑", save: "保存", cancel: "取消", delete: "删除",
  confirmDelete: "确定删除这条记录吗？", search: "搜索", noResults: "没有符合条件的内容。", empty: "还没有记录。",
  favorite: "收藏", favorited: "已收藏", title: "标题", description: "说明", category: "分类", date: "日期",
  status: "状态", actions: "操作", notes: "笔记", tags: "标签", subject: "科目", chapter: "章节", minutes: "分钟",
  dashboard: { title: "今天也继续前进一点。", subtitle: "这里显示你真实保存的学习数据。", study: "今日学习", tasks: "今日任务", reviews: "待复习", recent: "最近学习", subjects: "各科今日学习", noNews: "尚未配置实时新闻源", newsHelp: "配置可靠的 News API 或 RSS provider 后，真实新闻会显示在这里。" },
  plan: { title: "学习计划", subtitle: "管理今天、本周、逾期与已完成任务。", add: "添加任务", today: "今日", week: "本周", overdue: "逾期", completed: "已完成", unfinished: "未完成", all: "全部", planned: "预计时长", actual: "实际时长", priority: "优先级", low: "低", medium: "中", high: "高", todo: "待开始", progress: "进行中", done: "已完成", startFocus: "启动番茄钟", taskTitle: "任务名称" },
  subjectCenter: { learn: "学习中心", map: "思维导图", practice: "题库练习", wrong: "错题本", review: "复习", core: "核心概念", key: "重点", pitfalls: "易错点", ownNote: "我的笔记", mastery: "掌握状态", new: "未开始", learning: "学习中", reviewing: "复习中", mastered: "已掌握", lastStudy: "最近学习", due: "待复习", expand: "展开", collapse: "收起" },
  questions: { title: "统一题库", system: "系统原创练习题", submit: "提交答案", next: "下一题", random: "随机一题", retry: "再做一次", correct: "回答正确", incorrect: "回答错误", answer: "正确答案", explanation: "解析", accuracy: "正确率", history: "作答历史", mastered: "标记已掌握", single: "单选", multiple: "多选", true_false: "判断" },
  vocab: { title: "英语词汇", subtitle: "建立自己的词库，并根据熟悉度进入复习。", word: "单词", phonetic: "音标", meaning: "中文释义", example: "例句", exam: "考试分类", today: "今日单词", review: "复习单词", favorites: "收藏单词", know: "认识", vague: "模糊", unknown: "不认识", mastered: "已掌握", add: "添加单词" },
  reading: { title: "外刊阅读工作区", add: "保存文章", source: "来源", url: "原文 URL", published: "发布日期", excerpt: "合法短摘录", summary: "我的总结", vocabulary: "生词（逗号分隔）", unread: "未读", reading: "阅读中", finished: "已完成" },
  recitation: { title: "背诵", subtitle: "保存自己的背诵材料并安排复习。", add: "新增背诵材料", content: "背诵内容", today: "今日背诵", review: "待复习", mastered: "已掌握" },
  knowledge: { title: "个人知识库", subtitle: "搜索、整理并关联你的长期笔记。", add: "新建笔记", content: "内容", link: "关联内容" },
  books: { title: "书籍", add: "添加书籍", author: "作者", want: "想读", reading: "阅读中", finished: "已读完", progress: "阅读进度", rating: "评分", start: "开始日期", finish: "完成日期" },
  world: { title: "学习资源与探索", add: "保存资源", name: "名称", url: "URL", exam: "学习分类", disclaimer: "资源由你自行保存；系统不会将第三方资源标记为官方资源。" },
  health: { title: "健康", habit: "习惯", exercise: "运动记录", sleep: "睡眠记录", activity: "运动项目", hours: "睡眠小时", quality: "睡眠质量" },
  finance: { title: "财务", add: "添加收支", income: "收入", expense: "支出", amount: "金额", monthIncome: "本月收入", monthExpense: "本月支出", balance: "本月结余" },
  growth: { title: "成长目标", add: "新增目标", milestone: "里程碑", due: "截止日期", progress: "进度", active: "进行中", paused: "已暂停", completed: "已完成" },
  focus: { title: "专注", subtitle: "完成后自动生成学习记录并更新任务实际时长。", task: "关联任务（可选）", duration: "专注时长", custom: "自定义", start: "开始", pause: "暂停", resume: "继续", finish: "结束并记录", reset: "重置", idle: "准备开始", running: "正在专注", paused: "已暂停", saved: "已记录本次学习" },
  data: { title: "Beta 数据管理", local: "Beta 本地数据，仅保存在当前浏览器。请定期导出备份。", export: "导出个人数据 JSON", import: "导入个人数据 JSON", clear: "清空数据", confirmClear: "再次确认：清空当前浏览器内的全部个人数据？", invalid: "导入失败：文件不是有效的 Personal Learning OS Beta 数据。" },
  news: { title: "时政 / 热点", today: "今日", china: "国内", world: "国际", economy: "经济", technology: "科技", education: "教育", politics: "考研政治" },
};

const en: typeof zh = {
  loading: "Loading local data…", add: "Add", edit: "Edit", save: "Save", cancel: "Cancel", delete: "Delete",
  confirmDelete: "Delete this record?", search: "Search", noResults: "No matching content.", empty: "No records yet.",
  favorite: "Favorite", favorited: "Favorited", title: "Title", description: "Description", category: "Category", date: "Date",
  status: "Status", actions: "Actions", notes: "Notes", tags: "Tags", subject: "Subject", chapter: "Chapter", minutes: "min",
  dashboard: { title: "Take one more step today.", subtitle: "This page reflects your saved learning data.", study: "Study today", tasks: "Today's tasks", reviews: "Due reviews", recent: "Recent study", subjects: "Study by subject", noNews: "No live news source configured", newsHelp: "Real stories will appear after a trusted News API or RSS provider is configured." },
  plan: { title: "Study Plan", subtitle: "Manage today's, weekly, overdue, and completed tasks.", add: "Add task", today: "Today", week: "This week", overdue: "Overdue", completed: "Completed", unfinished: "Unfinished", all: "All", planned: "Planned", actual: "Actual", priority: "Priority", low: "Low", medium: "Medium", high: "High", todo: "To do", progress: "In progress", done: "Completed", startFocus: "Start focus", taskTitle: "Task title" },
  subjectCenter: { learn: "Learning Center", map: "Mind Map", practice: "Practice", wrong: "Wrong Questions", review: "Review", core: "Core concept", key: "Key points", pitfalls: "Common pitfalls", ownNote: "My notes", mastery: "Mastery", new: "New", learning: "Learning", reviewing: "Reviewing", mastered: "Mastered", lastStudy: "Last studied", due: "Due for review", expand: "Expand", collapse: "Collapse" },
  questions: { title: "Unified Question Bank", system: "Original system practice", submit: "Submit answer", next: "Next", random: "Random question", retry: "Try again", correct: "Correct", incorrect: "Incorrect", answer: "Correct answer", explanation: "Explanation", accuracy: "Accuracy", history: "Attempt history", mastered: "Mark mastered", single: "Single choice", multiple: "Multiple choice", true_false: "True / false" },
  vocab: { title: "English Vocabulary", subtitle: "Build your own list and review by familiarity.", word: "Word", phonetic: "Phonetic", meaning: "Meaning", example: "Example", exam: "Exam type", today: "Today's words", review: "Review words", favorites: "Favorites", know: "Know", vague: "Vague", unknown: "Don't know", mastered: "Mastered", add: "Add word" },
  reading: { title: "Reading Workspace", add: "Save article", source: "Source", url: "Original URL", published: "Published", excerpt: "Short lawful excerpt", summary: "My summary", vocabulary: "Vocabulary (comma-separated)", unread: "Unread", reading: "Reading", finished: "Finished" },
  recitation: { title: "Recitation", subtitle: "Save your own material and schedule reviews.", add: "Add material", content: "Content", today: "Today", review: "Due", mastered: "Mastered" },
  knowledge: { title: "Knowledge Base", subtitle: "Search, organize, and connect your long-term notes.", add: "New note", content: "Content", link: "Linked item" },
  books: { title: "Books", add: "Add book", author: "Author", want: "Want to read", reading: "Reading", finished: "Finished", progress: "Progress", rating: "Rating", start: "Start date", finish: "Finish date" },
  world: { title: "Learning Resources", add: "Save resource", name: "Name", url: "URL", exam: "Study category", disclaimer: "Resources are saved by you; third-party resources are never presented as official." },
  health: { title: "Health", habit: "Habit", exercise: "Exercise", sleep: "Sleep", activity: "Activity", hours: "Sleep hours", quality: "Sleep quality" },
  finance: { title: "Finance", add: "Add transaction", income: "Income", expense: "Expense", amount: "Amount", monthIncome: "Monthly income", monthExpense: "Monthly expense", balance: "Monthly balance" },
  growth: { title: "Growth Goals", add: "Add goal", milestone: "Milestone", due: "Due date", progress: "Progress", active: "Active", paused: "Paused", completed: "Completed" },
  focus: { title: "Focus", subtitle: "Completed sessions create study records and update task time.", task: "Linked task (optional)", duration: "Focus duration", custom: "Custom", start: "Start", pause: "Pause", resume: "Resume", finish: "Finish and save", reset: "Reset", idle: "Ready", running: "Focusing", paused: "Paused", saved: "Study session saved" },
  data: { title: "Beta Data Management", local: "Beta data is stored only in this browser. Export backups regularly.", export: "Export personal data JSON", import: "Import personal data JSON", clear: "Clear data", confirmClear: "Confirm again: clear all personal data in this browser?", invalid: "Import failed: this is not valid Personal Learning OS Beta data." },
  news: { title: "News / Current Affairs", today: "Today", china: "China", world: "World", economy: "Economy", technology: "Technology", education: "Education", politics: "Politics study" },
};

export type BetaMessages = typeof zh;
export function getBetaMessages(locale: Locale): BetaMessages { return locale === "en" ? en : zh; }
