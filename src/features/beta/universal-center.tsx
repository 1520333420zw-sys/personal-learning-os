"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { deriveSystemExamPoints } from "@/domain/learning/exam-point";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { BetaPage, Field, localDate, nowEntity, Tabs, uid } from "./shared";
import { addKnowledgeToRecitation } from "./recitation-service";
import { QuestionEngine } from "./question-engine";
import { PdfLibrary } from "./pdf-library";

export function UniversalCenter({ locale }: { locale: Locale }) {
  const { state, mutate } = useBetaData();
  const subjects = state.subjects.filter((subject) => subject.id.startsWith("subject-universal-"));
  const [subjectId, setSubjectId] = useState("subject-universal-mathematics");
  const [pointId, setPointId] = useState("");
  const [tab, setTab] = useState("learn");
  const subject = subjects.find((item) => item.id === subjectId) ?? subjects[0];
  const chapters = state.chapters.filter((item) => item.subjectId === subject?.id);
  const points = state.knowledgePoints.filter((item) => item.subjectId === subject?.id);
  const point = points.find((item) => item.id === pointId) ?? points[0];
  const exams = deriveSystemExamPoints(points, state.questions, state.reviewItems);
  const en = locale === "en";
  const title = en ? "Universal Learning" : "全科学习";
  const labels = en
    ? { learn: "Learning path", practice: "Practice", review: "Review", materials: "My PDFs", core: "Core idea", explain: "Understanding", key: "Key points", pitfall: "Common mistake", note: "My note", recite: "Add to recitation", schedule: "Schedule review", mastered: "Mastered", focus: "Focus", priority: "System priority", subjects: "Subjects", area: "Area" }
    : { learn: "学习路径", practice: "练习", review: "重点与复习", materials: "我的 PDF", core: "核心概念", explain: "理解说明", key: "重点", pitfall: "易错点", note: "我的笔记", recite: "加入背诵", schedule: "加入复习", mastered: "已掌握", focus: "专注", priority: "系统重点", subjects: "学科", area: "领域" };

  if (!subject) return null;
  return <BetaPage title={title} description={en ? "Study across disciplines with subject-specific explanations and one shared learning record." : "按学科与领域学习；笔记、练习、错题和复习共用同一数据层。"}>
    <section><h2 className="type-h3 mb-3 text-primary">{labels.subjects}</h2><div className="flex flex-wrap gap-2">{subjects.map((item) => <Button key={item.id} size="sm" variant={item.id === subject.id ? "primary" : "secondary"} onClick={() => { setSubjectId(item.id); setPointId(""); setTab("learn"); }}>{en ? item.nameEn : item.name}</Button>)}</div></section>
    <Card padding="sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="type-caption text-muted">{labels.area}</p><h2 className="type-h2 mt-1 text-primary">{en ? subject.nameEn : subject.name}</h2></div><Link className="inline-flex min-h-11 items-center rounded-md border border-border px-4 type-small text-primary hover:bg-surface-muted" href={`/${locale}/focus`}>{labels.focus} →</Link></div><p className="type-small mt-3 text-secondary">{chapters.map((chapter) => en ? chapter.titleEn : chapter.title).join(" · ")}</p></Card>
    <Tabs label={title} value={tab} onChange={setTab} items={(["learn", "practice", "review", "materials"] as const).map((id) => ({ id, label: labels[id] }))} />
    {tab === "learn" ? <div className="grid gap-5 desktop:grid-cols-[16rem_minmax(0,1fr)]"><Card padding="sm" className="self-start"><h3 className="type-h3 text-primary">{en ? "Knowledge points" : "知识点"}</h3><div className="mt-4 grid gap-1">{points.map((item) => <button key={item.id} type="button" onClick={() => setPointId(item.id)} className={`min-h-11 rounded-md px-3 text-left type-small ${item.id === point?.id ? "bg-accent-soft text-primary" : "text-secondary hover:bg-surface-muted"}`}>{en ? item.titleEn : item.title}</button>)}</div></Card>{point ? <Card variant="elevated" className="min-w-0"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="type-h2 text-primary">{en ? point.titleEn : point.title}</h3>{point.importance === 5 ? <Badge variant="warm">{labels.priority}</Badge> : null}</div><div className="mt-6 grid gap-5"><Detail title={labels.core} text={point.coreConcept} /><Detail title={labels.explain} text={point.explanation ?? point.coreConcept} /><Detail title={labels.key} text={point.keyPoints} /><Detail title={labels.pitfall} text={point.pitfalls} /><div><h4 className="type-label text-primary">{en ? "Related knowledge" : "关联知识点"}</h4><div className="mt-2 flex flex-wrap gap-2">{point.relatedPointIds?.map((id) => { const related = points.find((item) => item.id === id); return related ? <Button key={id} size="sm" variant="secondary" onClick={() => setPointId(id)}>{en ? related.titleEn : related.title}</Button> : null; })}</div></div>{point.learningBlocks?.map((block) => <div key={block.kind} className="rounded-md border border-border bg-surface-muted p-4"><h4 className="type-label text-primary">{block.title}</h4><p className="type-small mt-2 whitespace-pre-wrap break-words text-secondary">{block.body}</p></div>)}<Field label={labels.note}><textarea key={point.id} className="min-h-28 w-full rounded-md border border-border bg-surface p-3 text-primary" defaultValue={point.personalNote} onBlur={(event) => mutate((draft) => { const record = draft.knowledgePoints.find((item) => item.id === point.id); if (record) { record.personalNote = event.target.value; record.updatedAt = new Date().toISOString(); } })} /></Field><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => mutate((draft) => addKnowledgeToRecitation(draft, point.id))}>{labels.recite}</Button><Button size="sm" variant="secondary" onClick={() => mutate((draft) => { if (!draft.reviewItems.some((item) => item.kind === "knowledge" && item.targetId === point.id && item.status === "due")) draft.reviewItems.push({ ...nowEntity(uid("review"), draft.ownerId), kind: "knowledge", targetId: point.id, title: point.title, dueDate: localDate(), status: "due" }); })}>{labels.schedule}</Button><Button size="sm" variant="ghost" onClick={() => mutate((draft) => { const record = draft.knowledgePoints.find((item) => item.id === point.id); if (record) record.mastery = record.mastery === "mastered" ? "learning" : "mastered"; })}>{point.mastery === "mastered" ? "✓ " : ""}{labels.mastered}</Button><Button size="sm" variant="ghost" onClick={() => mutate((draft) => { const record = draft.knowledgePoints.find((item) => item.id === point.id); if (record) record.favorite = !record.favorite; })}>{point.favorite ? "★" : "☆"} {en ? "Favorite" : "收藏"}</Button></div></div></Card> : null}</div> : null}
    {tab === "practice" ? <QuestionEngine key={subject.id} locale={locale} subjectId={subject.id} /> : null}
    {tab === "review" ? <div className="grid gap-3">{exams.map((exam) => <Card key={exam.id} padding="sm"><div className="flex flex-wrap items-center gap-2"><Badge variant="warm">{labels.priority}</Badge><span className="type-label text-primary">{en ? points.find((item) => item.id === exam.knowledgePointId)?.titleEn : exam.title}</span></div><p className="type-small mt-3 text-secondary">{exam.reason}</p><p className="type-small mt-2 text-muted">{labels.pitfall}: {exam.commonMistakes}</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => { setPointId(exam.knowledgePointId); setTab("learn"); }}>{en ? "Study" : "学习"}</Button></Card>)}</div> : null}
    {tab === "materials" ? chapters.map((chapter) => <PdfLibrary key={chapter.id} locale={locale} ownerType="subject" ownerRecordId={chapter.id} subjectId={subject.id} chapterId={chapter.id} />) : null}
  </BetaPage>;
}

function Detail({ title, text }: { title: string; text: string }) { return <div><h4 className="type-label text-primary">{title}</h4><p className="type-body mt-2 whitespace-pre-wrap text-secondary">{text}</p></div>; }
