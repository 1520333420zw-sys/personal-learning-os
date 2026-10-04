# 312 主教材 Curriculum 与覆盖报告

版本：`2026.10-psychology-books-1`

本内容包只包含七本主教材的课程映射和 Personal Learning OS 原创教学内容。它不包含阿范题、实统测一本通、晴天小蓝小红、2000 题、1200 题、模拟卷或课程讲义，也不复制教材连续正文。

## 目录依据

- 彭聃龄、陈宝国《普通心理学》第六版：章、节名称与顺序按用户提供的 PDF 目录要求建立，并与[公开书目目录](https://www.yuntaigo.com/book.action?recordid=bnp6b29uemM5Nzg3MzAzMjg5NDc5)交叉核验。
- 林崇德《发展心理学》第三版：第一至第五章依据[人民教育出版社公开目录](https://www.pep.com.cn/products/jc/gsjks/201904/t20190425_1937567.shtml)；后续年龄阶段依据出版社内容介绍建立，具体小节待用户 PDF 校准。
- 陈琦、刘儒德《当代教育心理学》第三版：章、节名称与顺序依据[高等教育出版社公开目录](https://xuanshu.hep.com.cn/front/book/findBookDetails?bookId=60dee125adb85dae6a2f43bb)。
- 郭秀艳《实验心理学》2004 版：章、节名称与顺序依据[人民教育出版社公开目录](https://www.pep.com.cn/products/jc/201905/t20190530_1938764.shtml)。
- 侯玉波《社会心理学》第四版：已核验前六章的公开课程目录；后续结构明确标记待用户 PDF 校准。
- 戴海崎、张锋《心理与教育测量》第四版：第 1—9 章及第 17 章依据[公开书目信息](https://caixuan.aijiaocai.com/textbook/details?textbook_id=304238)；第 10—16 章不猜测标题，明确标记待用户 PDF 校准。
- 张厚粲、徐建平《现代心理与教育统计学》第五版：章、节名称与顺序依据[公开书目目录](https://www.yuntaigo.com/book.action?recordid=emFmbGhmemM5Nzg3MzAzMjU0MjYy)。

## 当前覆盖

| 教材 | 章 | 教材小节 | 映射 KnowledgePoint | Guided Lesson | Quick Check 可用 | 必背/Review 可用 | 目录状态 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 《普通心理学》第六版 | 14 | 58 | 41 | 100% | 100% | 100% | 已核验 |
| 《发展心理学》第三版 | 11 | 36 | 30 | 100% | 100% | 100% | 部分待 PDF 校准 |
| 《当代教育心理学》第三版 | 16 | 52 | 27 | 100% | 100% | 100% | 已核验 |
| 《实验心理学》2004 版 | 10 | 41 | 27 | 100% | 100% | 100% | 已核验 |
| 《社会心理学》第四版 | 8 | 24 | 27 | 100% | 100% | 100% | 部分待 PDF 校准 |
| 《心理与教育测量》第四版 | 17 | 30 | 27 | 100% | 100% | 100% | 第 10—16 章待 PDF 校准 |
| 《现代心理与教育统计学》第五版 | 14 | 58 | 32 | 100% | 100% | 100% | 已核验 |

“Quick Check 可用”表示每节可从对应知识点题目优先取题，不足时使用同一 312 系统原创题补足到 2—5 题。“必背/Review 可用”表示每节都能把映射知识点或该节原创总结写入现有统一背诵与 Review 系统。专属题和专属背诵的直接覆盖率由 `psychologyBookCoverage()` 单独输出，不能与上述可用率混淆。

每章另有一节系统原创章末整合课，用于知识地图、总复述、客观题、错题证据、必背和 Review。章末整合课不计入教材原目录的小节数量。

## 稳定 ID 与用户数据

- 教材、章、节使用稳定 ID；KnowledgePoint ID 沿用现有内容包。
- 同一个 KnowledgePoint 只映射到一本主教材的一个教材小节，章末整合课只引用它，不复制用户状态。
- 旧 `curriculum-psychology` 的 SectionProgress、CourseProgress 与 FeynmanAttempt 在读取旧 BetaState 时迁移到新的教材 Section ID。
- 用户笔记、题目尝试、错题、背诵、Review、StudySession 和 KnowledgePoint 掌握状态仍使用原有数据结构。
- 后续 PDF 校准只更新 Curriculum mapping，不应替换 KnowledgePoint 稳定 ID。
