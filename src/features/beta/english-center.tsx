"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Badge, Button, Card } from "@/components/ui";
import type { BetaEnglishContent, BetaVocabulary, EnglishContentKind, Mastery } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { areaClass, BetaPage, EmptyState, Field, fieldClass, localDate, Modal, nowEntity, Tabs, uid } from "./shared";
import { EnglishVocabulary } from "./english-vocabulary";
import { QuestionEngine } from "./question-engine";

const text = {
  "zh-CN": { title: "英语学习中心", intro: "自己的词汇、阅读与表达内容在这里持续积累。", words: "单词", sentence: "长难句", grammar: "语法", comprehension: "阅读理解", translation: "翻译", writing: "写作", reading: "外刊阅读", questions: "题库", review: "复习", add: "新增学习内容", content: "学习内容", note: "我的笔记 / 修改笔记", exam: "考试模式", titleField: "标题", mastery: "掌握状态", new: "未开始", learning: "学习中", reviewing: "复习中", mastered: "已掌握", favorite: "收藏", recite: "加入背诵", schedule: "加入复习", save: "保存", edit: "编辑", delete: "删除", empty: "这个分类还没有你保存的内容。", due: "到期复习", noDue: "目前没有到期的英语复习。", complete: "完成复习", confirm: "确定删除这项学习内容吗？", writingType: "写作内容类型", template: "作文模板", writingSentence: "句型", expression: "表达", essay: "我的作文" },
  en: { title: "English Learning Center", intro: "Build your own vocabulary, reading, and expression collection.", words: "Words", sentence: "Complex sentences", grammar: "Grammar", comprehension: "Reading comprehension", translation: "Translation", writing: "Writing", reading: "Article reading", questions: "Question bank", review: "Review", add: "Add study content", content: "Study content", note: "My notes / revision notes", exam: "Exam mode", titleField: "Title", mastery: "Mastery", new: "New", learning: "Learning", reviewing: "Reviewing", mastered: "Mastered", favorite: "Favorite", recite: "Add to recitation", schedule: "Schedule review", save: "Save", edit: "Edit", delete: "Delete", empty: "No saved content in this category yet.", due: "Due reviews", noDue: "No English reviews are due.", complete: "Complete review", confirm: "Delete this study item?", writingType: "Writing content type", template: "Essay template", writingSentence: "Sentence pattern", expression: "Expression", essay: "My essay" },
};
const modes: { id: BetaVocabulary["examType"]; zh: string; en: string }[] = [
  { id: "english1", zh: "考研英语一", en: "Postgraduate English I" }, { id: "english2", zh: "考研英语二", en: "Postgraduate English II" },
  { id: "cet4", zh: "CET-4", en: "CET-4" }, { id: "cet6", zh: "CET-6", en: "CET-6" }, { id: "general", zh: "通用英语", en: "General English" },
];
const studyKinds: EnglishContentKind[] = ["sentence", "grammar", "comprehension", "translation", "writing"];

export function EnglishCenter({ locale }: { locale: Locale }) {
  const l = text[locale]; const { state, mutate } = useBetaData();
  const [tab, setTab] = useState("words"); const [exam, setExam] = useState<BetaVocabulary["examType"]>("english1");
  const [editing, setEditing] = useState<BetaEnglishContent | "new" | null>(null);
  const english = state.subjects.find((subject) => subject.slug === "english");
  const items = state.englishContent.filter((item) => item.kind === tab && item.examType === exam);
  const due = state.reviewItems.filter((item) => item.status === "due" && item.dueDate <= localDate() &&
    (item.kind === "vocabulary" || item.kind === "recitation" && state.recitations.some((recitation) => recitation.id === item.targetId && recitation.subjectId === english?.id) || item.kind === "knowledge" && state.englishContent.some((content) => content.id === item.targetId)));
  function schedule(item: BetaEnglishContent) {
    mutate((draft) => { if (!draft.reviewItems.some((review) => review.targetId === item.id && review.status === "due")) draft.reviewItems.push({ ...nowEntity(uid("review"), draft.ownerId), kind: "knowledge", targetId: item.id, title: item.title, dueDate: localDate(), status: "due" }); });
  }
  function recite(item: BetaEnglishContent) {
    mutate((draft) => { if (draft.recitations.some((record) => record.type === "expression" && record.category === item.id)) return;
      draft.recitations.push({ ...nowEntity(uid("recitation"), draft.ownerId), title: item.title, category: item.id, content: item.content,
        status: "today", favorite: false, nextReviewAt: localDate(), subjectId: english?.id,
        type: item.kind === "writing" ? "writing" : "expression", reviewCount: 0, mastery: "new" }); });
  }
  const tabs = (["words", ...studyKinds, "reading", "questions", "review"] as const).map((id) => ({ id, label: l[id] }));
  return <BetaPage title={l.title} description={l.intro} action={<Field label={l.exam} className="min-w-52"><select className={fieldClass} value={exam} onChange={(event) => setExam(event.target.value as BetaVocabulary["examType"])}>{modes.map((mode) => <option key={mode.id} value={mode.id}>{locale === "en" ? mode.en : mode.zh}</option>)}</select></Field>}>
    <Tabs label={l.title} value={tab} onChange={setTab} items={tabs} />
    {tab === "words" ? <EnglishVocabulary locale={locale} exam={exam} /> : null}
    {studyKinds.includes(tab as EnglishContentKind) ? <div className="grid gap-3"><Button className="justify-self-start" onClick={() => setEditing("new")}>{l.add}</Button>{items.length ? items.map((item) => <Card key={item.id} padding="sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="type-h3 text-primary">{item.title}</h2><p className="type-body mt-3 whitespace-pre-wrap text-secondary">{item.content}</p></div><div className="flex gap-2">{item.writingType ? <Badge variant="neutral">{item.writingType === "sentence" ? l.writingSentence : l[item.writingType]}</Badge> : null}<Badge variant={item.mastery === "mastered" ? "success" : "neutral"}>{l[item.mastery]}</Badge></div></div><Field label={l.note} className="mt-4"><textarea key={item.id} className={areaClass} defaultValue={item.note} onBlur={(event) => mutate((draft) => { const record = draft.englishContent.find((entry) => entry.id === item.id); if (record) { record.note = event.target.value; record.updatedAt = new Date().toISOString(); } })} /></Field><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => setEditing(item)}>{l.edit}</Button><Button size="sm" variant="secondary" onClick={() => schedule(item)}>{l.schedule}</Button><Button size="sm" variant="secondary" onClick={() => recite(item)}>{l.recite}</Button><Button size="sm" variant="ghost" onClick={() => mutate((draft) => { const record = draft.englishContent.find((entry) => entry.id === item.id); if (record) record.favorite = !record.favorite; })}>{item.favorite ? "★" : "☆"} {l.favorite}</Button><Button size="sm" variant="ghost" onClick={() => { if (window.confirm(l.confirm)) mutate((draft) => { draft.englishContent = draft.englishContent.filter((entry) => entry.id !== item.id); }); }}>{l.delete}</Button></div></Card>) : <EmptyState>{l.empty}</EmptyState>}</div> : null}
    {tab === "reading" ? <Card><Link href={`/${locale}/reading`} className="type-label text-accent hover:underline">{l.reading} →</Link></Card> : null}
    {tab === "questions" ? <QuestionEngine locale={locale} subjectId={english?.id} /> : null}
    {tab === "review" ? <div className="grid gap-3">{due.length ? due.map((item) => <Card key={item.id} padding="sm"><div className="flex items-center justify-between gap-2"><p className="type-label text-primary">{item.title}</p><Button size="sm" onClick={() => mutate((draft) => { const record = draft.reviewItems.find((entry) => entry.id === item.id); if (record) { record.status = "completed"; record.completedAt = new Date().toISOString(); } })}>{l.complete}</Button></div></Card>) : <EmptyState>{l.noDue}</EmptyState>}</div> : null}
    {editing ? <ContentEditor locale={locale} item={editing === "new" ? undefined : editing} kind={tab as EnglishContentKind} exam={exam} onClose={() => setEditing(null)} /> : null}
  </BetaPage>;
}

function ContentEditor({ locale, item, kind, exam, onClose }: { locale: Locale; item?: BetaEnglishContent; kind: EnglishContentKind; exam: BetaVocabulary["examType"]; onClose: () => void }) {
  const l = text[locale]; const { mutate } = useBetaData();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("title") ?? "").trim();
    if (!title) return;
    mutate((draft) => { const values = { title, content: String(form.get("content") ?? ""), note: String(form.get("note") ?? ""), mastery: String(form.get("mastery")) as Mastery, examType: exam, kind, writingType: kind === "writing" ? String(form.get("writingType")) as BetaEnglishContent["writingType"] : undefined, updatedAt: new Date().toISOString() };
      if (item) { const record = draft.englishContent.find((entry) => entry.id === item.id); if (record) Object.assign(record, values); }
      else draft.englishContent.push({ ...nowEntity(uid("english"), draft.ownerId), ...values, favorite: false }); }); onClose();
  }
  return <Modal title={item ? l.edit : l.add} closeLabel={l.delete} onClose={onClose}><form className="grid gap-4" onSubmit={submit}><Field label={l.titleField}><input autoFocus required name="title" defaultValue={item?.title} className={fieldClass} /></Field>{kind === "writing" ? <Field label={l.writingType}><select name="writingType" defaultValue={item?.writingType ?? "template"} className={fieldClass}><option value="template">{l.template}</option><option value="sentence">{l.writingSentence}</option><option value="expression">{l.expression}</option><option value="essay">{l.essay}</option></select></Field> : null}<Field label={l.content}><textarea name="content" defaultValue={item?.content} className={areaClass} /></Field><Field label={l.note}><textarea name="note" defaultValue={item?.note} className={areaClass} /></Field><Field label={l.mastery}><select name="mastery" defaultValue={item?.mastery ?? "new"} className={fieldClass}>{(["new", "learning", "reviewing", "mastered"] as const).map((id) => <option key={id} value={id}>{l[id]}</option>)}</select></Field><Button type="submit">{l.save}</Button></form></Modal>;
}
