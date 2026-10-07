"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, Progress, Textarea } from "@/components/ui";
import { evaluateFeynman, recordQuickCheckAttempt, scheduleSectionKnowledgeReviews } from "@/domain";
import type { BetaKnowledgePoint, BetaQuestion } from "@/domain/beta";
import type { Curriculum, CurriculumChapter, CurriculumSection, TeachingUnit } from "@/domain/learning/curriculum";
import { addKnowledgeToRecitation, reviewRecitation, type RecallRating } from "@/features/beta/recitation-service";
import { BetaPage, nowEntity, uid } from "@/features/beta/shared";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";

export type PsychologySectionMode = "study" | "practice" | "past-papers" | "recitation";

interface Props {
  locale: Locale;
  curriculum: Curriculum;
  chapter: CurriculumChapter;
  section: CurriculumSection;
  unit: TeachingUnit;
  chapterSections: CurriculumSection[];
  previous?: CurriculumSection;
  next?: CurriculumSection;
  mode: PsychologySectionMode;
}

const modes: PsychologySectionMode[] = ["study", "practice", "past-papers", "recitation"];

export function PsychologySectionPages(props: Props) {
  const { locale, curriculum, chapter, section, previous, next, mode } = props;
  const { state } = useBetaData();
  const en = locale === "en";
  const points = section.knowledgePointIds.map((id) => state.knowledgePoints.find((point) => point.id === id)).filter(Boolean) as BetaKnowledgePoint[];
  const understood = points.filter((point) => point.mastery === "reviewing" || point.mastery === "mastered").length;
  const base = `/${locale}/learn/${curriculum.id}/${chapter.id}/${section.id}`;
  const labels = en
    ? { study: "Study", practice: "Exercises", "past-papers": "Past papers", recitation: "Recall" }
    : { study: "学习", practice: "课后习题", "past-papers": "历年真题", recitation: "背诵" };
  const title = locale === "en" ? section.titleEn : section.title;

  return <BetaPage title={title} description="" action={<div className="flex gap-4">{previous ? <Link className="type-label text-secondary hover:text-accent" href={`/${locale}/learn/${curriculum.id}/${previous.chapterId}/${previous.id}`}>← {en ? "Previous" : "上一节"}</Link> : null}{next ? <Link className="type-label text-secondary hover:text-accent" href={`/${locale}/learn/${curriculum.id}/${next.chapterId}/${next.id}`}>{en ? "Next" : "下一节"} →</Link> : null}</div>}>
    <nav className="flex flex-wrap items-center gap-2 type-caption text-muted" aria-label={en ? "Breadcrumb" : "面包屑"}>
      <Link href={`/${locale}/psychology`} className="hover:text-accent">{en ? "312 Psychology" : "312 心理学"}</Link><span>›</span>
      <Link href={`/${locale}/learn/${curriculum.id}`} className="hover:text-accent">{en ? curriculum.titleEn : curriculum.title}</Link><span>›</span>
      <span>{en ? chapter.titleEn : chapter.title}</span><span>›</span><span className="text-primary">{title}</span>
    </nav>
    <div className="rounded-lg border border-border bg-surface-raised px-5 py-4">
      <p className="type-caption text-muted">{en ? curriculum.titleEn : curriculum.title} · {en ? chapter.titleEn : chapter.title}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div><h2 className="type-h2 text-primary">{title}</h2><p className="type-small mt-2 text-secondary">{en ? `${points.length} knowledge points` : `本节共 ${points.length} 个知识点`}</p></div><p className="type-label text-primary">{en ? "Progress" : "本节进度"}：{understood} / {points.length}</p></div>
      <Progress className="mt-3" value={points.length ? understood / points.length * 100 : 0}/>
    </div>
    <nav aria-label={en ? "Section navigation" : "小节导航"} className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-border bg-canvas/95 pt-2">
      {modes.map((item) => <Link key={item} href={item === "study" ? base : `${base}/${item}`} aria-current={mode === item ? "page" : undefined} className={`min-h-11 shrink-0 border-b-2 px-4 py-3 type-label ${mode === item ? "border-accent text-primary" : "border-transparent text-secondary hover:border-border-strong"}`}>{labels[item]}</Link>)}
    </nav>
    {mode === "study" ? <StudyView {...props} points={points} understood={understood}/> : null}
    {mode === "practice" ? <PracticeView {...props} points={points}/> : null}
    {mode === "past-papers" ? <PastPaperView locale={locale} points={points}/> : null}
    {mode === "recitation" ? <RecitationView {...props} points={points}/> : null}
  </BetaPage>;
}

function StudyView({ locale, curriculum, chapter, section, unit, next, points, understood }: Props & { points: BetaKnowledgePoint[]; understood: number }) {
  const { state, mutate } = useBetaData();
  const en = locale === "en";
  const [activeId, setActiveId] = useState(points[0]?.id ?? "");
  const [feynmanId, setFeynmanId] = useState<string>();
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState<ReturnType<typeof evaluateFeynman>>();
  const sourcePdfs = state.pdfDocuments.filter((document) => document.subjectId === curriculum.subjectId && (document.chapterId === chapter.sourceChapterId || document.ownerRecordId === chapter.sourceChapterId));
  const examCount = points.filter(isExamPoint).length;

  function markUnderstood(pointId: string) {
    mutate((draft) => {
      const point = draft.knowledgePoints.find((item) => item.id === pointId);
      if (!point) return;
      const now = new Date();
      point.mastery = "reviewing"; point.lastStudiedAt = now.toISOString(); point.updatedAt = now.toISOString();
      const progress = draft.studyProgress.find((item) => item.targetType === "knowledge" && item.targetId === pointId);
      if (progress) { progress.status = "reviewing"; progress.percent = 70; progress.updatedAt = now.toISOString(); }
      else draft.studyProgress.push({ ...nowEntity(uid("progress"), draft.ownerId), targetType: "knowledge", targetId: pointId, status: "reviewing", percent: 70 });
      const allUnderstood = section.knowledgePointIds.every((id) => id === pointId || draft.knowledgePoints.some((item) => item.id === id && (item.mastery === "reviewing" || item.mastery === "mastered")));
      if (allUnderstood) {
        const sectionProgress = draft.sectionProgress.find((item) => item.sectionId === section.id);
        if (sectionProgress) { sectionProgress.status = "completed"; sectionProgress.completedAt = now.toISOString(); sectionProgress.lastStudiedAt = now.toISOString(); sectionProgress.updatedAt = now.toISOString(); }
        let chapterProgress = draft.chapterProgress.find((item) => item.chapterId === chapter.id);
        if (!chapterProgress) { chapterProgress = { ...nowEntity(`chapter-progress-${chapter.id}`, draft.ownerId), curriculumId: curriculum.id, chapterId: chapter.id, completedSectionIds: [], chapterPracticeCompleted: false, recitationCompleted: false, reviewScheduled: false, lastStudiedAt: now.toISOString() }; draft.chapterProgress.push(chapterProgress); }
        if (!chapterProgress.completedSectionIds.includes(section.id)) chapterProgress.completedSectionIds.push(section.id);
        chapterProgress.lastStudiedAt = now.toISOString(); chapterProgress.updatedAt = now.toISOString();
        scheduleSectionKnowledgeReviews(draft, section.knowledgePointIds, now);
      }
    });
  }

  function saveFeynman(point: BetaKnowledgePoint) {
    const pointUnit: TeachingUnit = { ...unit, requiredTerms: [point.title, ...(point.coreConcepts ?? [])].filter((term) => term.length >= 2).slice(0, 5), feynmanPrompts: [`不看上面的内容，用自己的话解释“${point.title}”，并举一个例子。`] };
    const result = evaluateFeynman(response, pointUnit); setFeedback(result);
    mutate((draft) => { const prior = draft.feynmanAttempts.filter((item) => item.sectionId === section.id && item.knowledgePointIds.includes(point.id)); draft.feynmanAttempts.push({ ...nowEntity(uid("feynman"), draft.ownerId), sectionId: section.id, knowledgePointIds: [point.id], response, selfRating: result.complete ? "good" : "hard", feedback: result.message, retryCount: prior.length, matchedTerms: result.matchedTerms, missingTerms: result.missingTerms }); if (!result.complete) scheduleSectionKnowledgeReviews(draft, [point.id]); });
  }

  return <div className="grid gap-6 desktop:grid-cols-[14rem_minmax(0,1fr)] desktop:items-start">
    <aside className="rounded-lg border border-border bg-surface-raised p-3 desktop:sticky desktop:top-20"><p className="type-label px-2 text-primary">{en ? "Knowledge points" : "知识点导航"}</p><div className="mt-3 grid gap-1">{points.map((point, index) => { const done = point.mastery === "reviewing" || point.mastery === "mastered"; return <a key={point.id} href={`#knowledge-${point.id}`} onClick={() => setActiveId(point.id)} className={`min-h-11 rounded-md px-3 py-2 type-small ${activeId === point.id ? "bg-accent-soft text-primary" : "text-secondary hover:bg-surface-muted"}`}><span aria-hidden>{done ? "✓" : activeId === point.id ? "●" : "○"}</span> {String(index + 1).padStart(2, "0")} {isExamPoint(point) ? "🔥" : ""}</a>; })}</div></aside>
    <div className="min-w-0 grid gap-6">
      <Card padding="sm"><div className="flex flex-wrap items-center gap-2"><Badge variant={section.sourceStatus === "verified" ? "neutral" : "warm"}>{section.sourceStatus === "verified" ? (en ? "Outline verified" : "目录已核验") : (en ? "Calibration pending" : "待教材校准")}</Badge>{sourcePdfs.length ? <span className="type-caption text-muted">{en ? `${sourcePdfs.length} linked PDF(s)` : `已关联 ${sourcePdfs.length} 份个人教材 PDF`}</span> : null}</div><p className="type-small mt-3 text-secondary">{sourcePdfs.length ? (en ? "Use the linked PDF as the source text. Explanations below are teaching aids." : "教材正文以已关联 PDF 为准；下方简单理解与例子属于教学辅助。") : (en ? "No verifiable textbook text is linked. System explanations are clearly marked as teaching aids." : "尚未关联可核验教材正文；系统解释均明确标记为教学辅助，不冒充教材原文。")}</p></Card>
      {points.length ? points.map((point, index) => <article id={`knowledge-${point.id}`} key={point.id} className="scroll-mt-24 rounded-lg border border-border bg-surface-raised p-5 tablet:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="type-caption text-muted">{en ? "Knowledge point" : "知识点"} {String(index + 1).padStart(2, "0")}</p><div className="mt-2 flex flex-wrap items-center gap-2"><h3 className="type-h2 text-primary">{en ? point.titleEn : point.title}</h3>{isExamPoint(point) ? <Badge variant="apricot">🔥 {en ? "Exam point" : "考点"}{point.importance ? ` ${"★".repeat(Math.min(3, Math.max(1, point.importance - 2)))}` : ""}</Badge> : null}</div></div><MasteryBadge locale={locale} point={point}/></div>
        <KnowledgeBlock title={en ? "Textbook knowledge" : "教材知识"} body={point.definition ?? point.coreConcept}/>
        <KnowledgeBlock title={en ? "Plain explanation · teaching aid" : "简单理解 · 教学辅助"} body={point.explanation ?? point.keyPoints} muted/>
        {point.examples?.[0] ? <KnowledgeBlock title={en ? "Example · teaching aid" : "例子 · 教学辅助"} body={point.examples[0]} warm/> : null}
        {isExamPoint(point) ? <KnowledgeBlock title={en ? "Exam reminder" : "考试提醒"} body={(point.examFocus ?? [point.keyPoints]).join("\n")} accent/> : null}
        <div className="mt-6 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => { setFeynmanId(feynmanId === point.id ? undefined : point.id); setResponse(""); setFeedback(undefined); }}>🧠 {en ? "Feynman explanation" : "费曼讲解"}</Button><Button size="sm" variant="secondary" onClick={() => document.getElementById(`note-${point.id}`)?.focus()}>{en ? "Take note" : "记笔记"}</Button><Button size="sm" onClick={() => markUnderstood(point.id)} disabled={point.mastery === "reviewing" || point.mastery === "mastered"}>{point.mastery === "reviewing" || point.mastery === "mastered" ? `✓ ${en ? "Understood" : "已学懂"}` : (en ? "Mark understood" : "标记已学懂")}</Button></div>
        {feynmanId === point.id ? <div className="mt-5 rounded-lg border border-border bg-surface-muted p-5"><Badge variant="warm">Feynman</Badge><h4 className="type-h3 mt-3 text-primary">{en ? "Explain this knowledge point simply" : "把这个知识点讲简单"}</h4><p className="type-small mt-3 text-secondary">{point.explanation ?? point.coreConcept}</p>{point.examples?.[0] ? <p className="type-small mt-3 text-secondary">{en ? "Example" : "例子"}：{point.examples[0]}</p> : null}<p className="type-small mt-3 text-secondary">{en ? "Easy-to-confuse point" : "最容易混淆"}：{point.pitfalls}</p><p className="type-label mt-5 text-primary">{en ? `Without looking above, explain what “${point.titleEn}” means.` : `现在不要看上面的内容，用自己的话告诉我：“${point.title}”是什么意思？`}</p><Textarea className="mt-3" rows={5} value={response} onChange={(event) => setResponse(event.target.value)}/><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => saveFeynman(point)} disabled={response.trim().length < 8}>{en ? "Check recall" : "检查复述"}</Button><Button size="sm" variant="secondary" onClick={() => setFeedback({ matchedTerms: [], missingTerms: [], possibleErrors: [], revisit: [], complete: false, message: point.coreConcept })}>{en ? "Explain more simply" : "再讲简单一点"}</Button><Button size="sm" variant="ghost" onClick={() => { setResponse(""); setFeedback(undefined); }}>{en ? "Retry" : "重新复述"}</Button></div>{feedback ? <div className="mt-4 rounded-md border border-border bg-surface-raised p-4" aria-live="polite"><p className="type-caption text-muted">{en ? "Local rule-based check, not AI judgment" : "本地规则检查，不冒充 AI 判断"}</p><p className="type-small mt-2 text-primary">{feedback.complete ? "✓ " : "△ "}{feedback.message}</p>{feedback.matchedTerms.length ? <p className="type-small mt-2 text-secondary">✓ {en ? "Covered" : "已经讲清楚"}：{feedback.matchedTerms.join("、")}</p> : null}{feedback.missingTerms.length ? <p className="type-small mt-1 text-secondary">○ {en ? "Missing" : "遗漏的重要内容"}：{feedback.missingTerms.join("、")}</p> : null}</div> : null}</div> : null}
        <label htmlFor={`note-${point.id}`} className="type-label mt-6 block text-primary">{en ? "My note" : "我的笔记"}</label><Textarea id={`note-${point.id}`} className="mt-2" rows={4} defaultValue={point.personalNote} onBlur={(event) => mutate((draft) => { const record = draft.knowledgePoints.find((item) => item.id === point.id); if (record) { record.personalNote = event.target.value; record.updatedAt = new Date().toISOString(); } })}/>
      </article>) : <Card>{en ? "Textbook knowledge points are awaiting verified source material." : "本节知识点等待可靠教材资料补充。"}</Card>}
      {points.length > 0 && understood === points.length ? <Card variant="elevated" className="text-center"><Badge variant="success">✓ {en ? "Section study complete" : "本节学习完成"}</Badge><h3 className="type-h2 mt-4 text-primary">{understood} / {points.length} {en ? "knowledge points studied" : "个知识点已学习"}</h3><p className="type-small mt-2 text-secondary">🔥 {en ? "Exam points" : "本节考点"}：{examCount} · 🧠 {en ? "Feynman attempts" : "费曼复述"}：{state.feynmanAttempts.filter((item) => item.sectionId === section.id).length}</p><div className="mt-5 flex flex-wrap justify-center gap-2"><LinkButton href={`${baseHref(locale, curriculum.id, chapter.id, section.id)}/practice`}>{en ? "Do exercises" : "做课后习题"}</LinkButton><LinkButton href={`${baseHref(locale, curriculum.id, chapter.id, section.id)}/recitation`}>{en ? "Start recall" : "进入背诵"}</LinkButton><LinkButton href={`${baseHref(locale, curriculum.id, chapter.id, section.id)}/past-papers`}>{en ? "Past papers" : "查看历年真题"}</LinkButton>{next ? <LinkButton href={`/${locale}/learn/${curriculum.id}/${next.chapterId}/${next.id}`}>{en ? "Next section" : "下一节"}</LinkButton> : null}</div></Card> : null}
      <SectionFooter locale={locale} curriculumId={curriculum.id} previous={undefined} next={next}/>
    </div>
  </div>;
}

function PracticeView({ locale, points }: Props & { points: BetaKnowledgePoint[] }) {
  const { state } = useBetaData(); const en = locale === "en";
  const pointIds = useMemo(() => new Set(points.map((point) => point.id)), [points]);
  const questions = state.questions.filter((question) => question.knowledgePointId && pointIds.has(question.knowledgePointId) && !(question.isOfficial && question.year));
  return <div className="grid gap-5"><div><h2 className="type-h2 text-primary">{en ? "Section exercises" : "课后习题"}</h2><p className="type-small mt-2 text-secondary">{en ? "Questions are tied to this section and its knowledge points. Wrong answers enter the shared mistake and review system." : "题目只来自本节关联知识点；错题会进入现有统一错题与复习体系。"}</p></div>{questions.length ? <SectionQuestionRunner locale={locale} questions={questions}/> : <Card><h3 className="type-h3 text-primary">{en ? "No exercises yet" : "当前暂无本节练习"}</h3><p className="type-small mt-2 text-secondary">{en ? "Import a legal question source or add verified system-authored exercises. No unrelated fallback questions are shown." : "等待导入合法题库或补充经过审核的系统原创练习；不会展示其他章节的题目充数。"}</p></Card>}</div>;
}

function PastPaperView({ locale, points }: { locale: Locale; points: BetaKnowledgePoint[] }) {
  const { state } = useBetaData(); const en = locale === "en"; const ids = new Set(points.map((point) => point.id));
  const questions = state.questions.filter((question) => question.isOfficial === true && typeof question.year === "number" && question.knowledgePointId && ids.has(question.knowledgePointId));
  return <div className="grid gap-5"><div><h2 className="type-h2 text-primary">{en ? "Verified past papers" : "历年真题"}</h2><p className="type-small mt-2 text-secondary">{en ? "Only questions with verified official identity and year appear here." : "这里只显示已核验真题身份与年份的题目，系统原创练习不会混入。"}</p></div>{questions.length ? questions.map((question) => <Card key={question.id}><div className="flex flex-wrap gap-2"><Badge variant="neutral">{question.year}</Badge><Badge variant="neutral">{question.questionType}</Badge><Badge variant="warm">{question.sourceLabel ?? question.source}</Badge></div><h3 className="type-h3 mt-4 text-primary">{question.stem}</h3><p className="type-small mt-3 text-secondary">{en ? "Knowledge point" : "对应知识点"}：{points.find((point) => point.id === question.knowledgePointId)?.title ?? "—"}</p><details className="mt-4"><summary className="cursor-pointer type-label text-accent">{en ? "Answer and explanation" : "答案与解析"}</summary><p className="type-small mt-3 text-secondary">{question.answer.map((id) => question.options.find((option) => option.id === id)?.text).filter(Boolean).join("、")}</p><p className="type-small mt-2 text-secondary">{question.explanation}</p></details></Card>) : <Card><h3 className="type-h3 text-primary">{en ? "No verified past-paper questions for this section." : "当前暂无已核验的本节历年真题。"}</h3><p className="type-small mt-2 text-secondary">{en ? "Future imported past-paper PDFs can extend this source." : "以后可以通过合法历年真题资料继续补充。"}</p></Card>}</div>;
}

function RecitationView({ locale, chapter, points }: Props & { points: BetaKnowledgePoint[] }) {
  const { state, mutate } = useBetaData(); const en = locale === "en"; const [revealed, setRevealed] = useState<string[]>([]);
  const ratingMap: Record<"again" | "hard" | "good" | "easy", RecallRating> = { again: "forgot", hard: "vague", good: "remembered", easy: "mastered" };
  function rate(point: BetaKnowledgePoint, rating: keyof typeof ratingMap) { mutate((draft) => { addKnowledgeToRecitation(draft, point.id); const item = draft.recitations.find((record) => record.knowledgePointId === point.id); if (item) reviewRecitation(draft, item.id, ratingMap[rating]); }); }
  return <div className="grid gap-5"><div><h2 className="type-h2 text-primary">{en ? "Active recall" : "本节背诵"}</h2><p className="type-small mt-2 text-secondary">{en ? "Recall before revealing the answer. Ratings use the existing Ebbinghaus review engine." : "先主动回忆，再显示答案；反馈继续使用现有艾宾浩斯 Review Engine。"}</p></div>{points.length ? points.map((point) => { const open = revealed.includes(point.id); const existing = state.recitations.find((item) => item.knowledgePointId === point.id); return <Card key={point.id}><p className="type-caption text-muted">{chapter.title}</p><h3 className="type-h3 mt-2 text-primary">{recallPrompt(point, en)}</h3>{open ? <div className="mt-5 rounded-md bg-surface-muted p-5"><p className="whitespace-pre-wrap type-body text-secondary">{point.memoryVersion ?? [point.coreConcept, point.keyPoints].filter(Boolean).join("\n")}</p><div className="mt-4 flex flex-wrap gap-2">{(["again", "hard", "good", "easy"] as const).map((rating) => <Button key={rating} size="sm" variant={rating === "good" ? "primary" : "secondary"} onClick={() => rate(point, rating)}>{rating === "again" ? "Again" : rating === "hard" ? "Hard" : rating === "good" ? "Good" : "Easy"}</Button>)}</div>{existing?.nextReviewAt ? <p className="type-caption mt-3 text-muted">{en ? "Next review" : "下次复习"}：{existing.nextReviewAt}</p> : null}</div> : <Button className="mt-5" variant="secondary" onClick={() => setRevealed((current) => [...current, point.id])}>{en ? "Show answer" : "显示答案"}</Button>}</Card>; }) : <Card>{en ? "No verified recall content is linked yet." : "本节暂无可核验的背诵内容。"}</Card>}</div>;
}

function SectionQuestionRunner({ locale, questions }: { locale: Locale; questions: BetaQuestion[] }) {
  const { state, mutate } = useBetaData(); const en = locale === "en"; const [index, setIndex] = useState(0); const [selected, setSelected] = useState<string[]>([]); const [submitted, setSubmitted] = useState(false); const question = questions[index]; const correct = selected.length === question.answer.length && [...selected].sort().every((item, at) => item === [...question.answer].sort()[at]);
  const favorited = state.favorites.some((item) => item.targetType === "question" && item.targetId === question.id);
  function choose(id: string) { if (submitted) return; setSelected(question.questionType === "multiple" ? (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]) : [id]); }
  function submit() { if (!selected.length) return; setSubmitted(true); mutate((draft) => { recordQuickCheckAttempt(draft, question.id, selected, new Date(), uid); }); }
  return <Card variant="elevated"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2"><Badge variant="warm">{index + 1} / {questions.length}</Badge><Badge variant="neutral">{question.sourceType === "user" || question.sourceType === "imported" ? question.sourceLabel ?? question.source : (en ? "System-authored practice" : "系统原创练习")}</Badge></div><Button size="sm" variant="ghost" onClick={() => mutate((draft) => { const existing = draft.favorites.find((item) => item.targetType === "question" && item.targetId === question.id); if (existing) draft.favorites = draft.favorites.filter((item) => item.id !== existing.id); else draft.favorites.push({ ...nowEntity(uid("favorite"), draft.ownerId), targetType: "question", targetId: question.id }); })}>{favorited ? "★" : "☆"} {en ? "Favorite" : "收藏"}</Button></div><h3 className="type-h3 mt-5 text-primary">{question.stem}</h3><div className="mt-5 grid gap-3">{question.options.map((option, optionIndex) => <button key={option.id} type="button" aria-pressed={selected.includes(option.id)} onClick={() => choose(option.id)} className={`min-h-12 rounded-md border p-3 text-left type-body ${selected.includes(option.id) ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-border-strong"}`}>{String.fromCharCode(65 + optionIndex)}. {option.text}</button>)}</div>{submitted ? <div className={`mt-5 rounded-md border p-4 ${correct ? "border-success bg-success-soft" : "border-error bg-error-soft"}`} aria-live="polite"><p className="type-label text-primary">{correct ? (en ? "Correct" : "回答正确") : (en ? "Incorrect · added to mistakes" : "回答错误 · 已进入错题体系")}</p><p className="type-small mt-2 text-secondary">{en ? "Answer" : "答案"}：{question.answer.map((id) => question.options.find((option) => option.id === id)?.text).join("、")}</p><p className="type-small mt-2 text-secondary">{question.explanation}</p></div> : null}<div className="mt-5 flex gap-2">{!submitted ? <Button onClick={submit} disabled={!selected.length}>{en ? "Submit" : "提交答案"}</Button> : <><Button variant="secondary" onClick={() => { setSelected([]); setSubmitted(false); }}>{en ? "Try again" : "再做一次"}</Button>{index < questions.length - 1 ? <Button onClick={() => { setIndex((value) => value + 1); setSelected([]); setSubmitted(false); }}>{en ? "Next" : "下一题"}</Button> : null}</>}</div><p className="type-caption mt-5 text-muted">{en ? "Linked knowledge point" : "关联知识点"}：{state.knowledgePoints.find((point) => point.id === question.knowledgePointId)?.title ?? "—"}</p></Card>;
}

function KnowledgeBlock({ title, body, muted, warm, accent }: { title: string; body: string; muted?: boolean; warm?: boolean; accent?: boolean }) { return <section className={`mt-5 rounded-md p-4 ${warm ? "bg-warm-oat-soft" : accent ? "border-l-4 border-accent bg-accent-soft" : muted ? "bg-surface-muted" : "border border-border bg-surface"}`}><h4 className="type-label text-primary">{title}</h4><p className="mt-2 whitespace-pre-wrap type-body leading-7 text-secondary">{body}</p></section>; }
function MasteryBadge({ locale, point }: { locale: Locale; point: BetaKnowledgePoint }) { const en = locale === "en"; const label = point.mastery === "new" ? (en ? "Not studied" : "未学习") : point.mastery === "mastered" || point.mastery === "reviewing" ? (en ? "Understood" : "已学懂") : (en ? "Learning" : "学习中"); return <Badge variant={point.mastery === "mastered" || point.mastery === "reviewing" ? "success" : "neutral"}>{label}</Badge>; }
function isExamPoint(point: BetaKnowledgePoint) { return Boolean(point.examFocus?.length || point.frequency === "high"); }
function recallPrompt(point: BetaKnowledgePoint, en: boolean) { if (point.memoryVersion?.includes("？")) return point.memoryVersion.split("？")[0] + "？"; return en ? `Recall the definition and key points of “${point.titleEn}”.` : `“${point.title}”的定义与核心要点是什么？`; }
function baseHref(locale: Locale, curriculumId: string, chapterId: string, sectionId: string) { return `/${locale}/learn/${curriculumId}/${chapterId}/${sectionId}`; }
function LinkButton({ href, children }: { href: string; children: React.ReactNode }) { return <Link href={href} className="inline-flex min-h-10 items-center rounded-md border border-border-strong bg-surface px-3 type-label text-primary hover:bg-surface-muted">{children}</Link>; }
function SectionFooter({ locale, curriculumId, previous, next }: { locale: Locale; curriculumId: string; previous?: CurriculumSection; next?: CurriculumSection }) { return <nav className="flex justify-between gap-4 border-t border-border pt-5" aria-label={locale === "en" ? "Lesson navigation" : "课程导航"}>{previous ? <Link className="type-label text-accent" href={`/${locale}/learn/${curriculumId}/${previous.chapterId}/${previous.id}`}>← {locale === "en" ? "Previous" : "上一节"}</Link> : <span/>}{next ? <Link className="type-label text-accent" href={`/${locale}/learn/${curriculumId}/${next.chapterId}/${next.id}`}>{locale === "en" ? "Next" : "下一节"} →</Link> : null}</nav>; }

