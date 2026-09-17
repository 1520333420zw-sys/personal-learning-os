"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Card } from "@/components/ui";
import type { BetaRecitation } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { getBetaMessages } from "@/i18n/beta-messages";
import { useBetaData } from "@/providers";
import { areaClass, BetaPage, EmptyState, Field, fieldClass, localDate, Modal, nowEntity, Tabs, uid } from "./shared";
import { dueRecitations, reviewRecitation, type RecallRating } from "./recitation-service";

export function RecitationCenter({ locale }: { locale: Locale }) {
  const m = getBetaMessages(locale); const { state, mutate } = useBetaData();
  const [filter, setFilter] = useState("today"); const [editing, setEditing] = useState<BetaRecitation | "new" | null>(null);
  const due = new Set(dueRecitations(state).map((item) => item.id));
  const items = state.recitations.filter((item) => filter === "all" ||
    (filter === "today" && due.has(item.id)) || (filter === "mastered" && item.status === "mastered") ||
    (filter === "favorite" && item.favorite));
  const ratings: [RecallRating, string][] = [["forgot", m.recitation.forgot], ["vague", m.recitation.vague], ["remembered", m.recitation.remembered], ["mastered", m.recitation.rateMastered]];
  return <BetaPage title={m.recitation.title} description={m.recitation.subtitle} action={<Button onClick={() => setEditing("new")}>{m.recitation.add}</Button>}>
    <Tabs label={m.status} value={filter} onChange={setFilter} items={[
      { id: "today", label: m.recitation.today }, { id: "all", label: m.plan.all },
      { id: "mastered", label: m.recitation.mastered }, { id: "favorite", label: m.favorite },
    ]} />
    <div className="grid gap-3">{items.length ? items.map((item) => {
      const subject = state.subjects.find((entry) => entry.id === item.subjectId);
      const chapter = state.chapters.find((entry) => entry.id === item.chapterId);
      return <Card key={item.id} padding="sm"><div className="flex flex-wrap items-start justify-between gap-3"><div>
        <p className="type-caption text-muted">{subject ? locale === "en" ? subject.nameEn : subject.name : item.category}{chapter ? ` · ${locale === "en" ? chapter.titleEn : chapter.title}` : ""}</p>
        <h2 className="type-h3 mt-1 text-primary">{item.title}</h2><p className="type-body mt-3 whitespace-pre-wrap text-secondary">{item.content}</p>
        <div className="mt-3 flex flex-wrap gap-2"><Badge variant={item.status === "mastered" ? "success" : "neutral"}>{m.recitation[item.status]}</Badge><span className="type-caption text-muted">{item.nextReviewAt ?? localDate()}</span></div>
      </div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => setEditing(item)}>{m.edit}</Button><Button size="sm" variant="ghost" onClick={() => mutate((draft) => { const record = draft.recitations.find((entry) => entry.id === item.id); if (record) record.favorite = !record.favorite; })}>{item.favorite ? m.favorited : m.favorite}</Button><Button size="sm" variant="ghost" onClick={() => { if (window.confirm(m.confirmDelete)) mutate((draft) => { draft.recitations = draft.recitations.filter((entry) => entry.id !== item.id); draft.reviewItems = draft.reviewItems.filter((entry) => !(entry.kind === "recitation" && entry.targetId === item.id)); }); }}>{m.delete}</Button></div></div>
        {item.status !== "mastered" ? <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">{ratings.map(([rating, label]) => <Button key={rating} size="sm" variant={rating === "remembered" ? "primary" : "secondary"} onClick={() => mutate((draft) => reviewRecitation(draft, item.id, rating))}>{label}</Button>)}</div> : <Button className="mt-4" size="sm" variant="secondary" onClick={() => mutate((draft) => { const record = draft.recitations.find((entry) => entry.id === item.id); if (record) { record.status = "review"; record.nextReviewAt = localDate(); } })}>{m.recitation.review}</Button>}
      </Card>;
    }) : <EmptyState>{m.empty}</EmptyState>}</div>
    {editing ? <RecitationEditor locale={locale} item={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} /> : null}
  </BetaPage>;
}

function RecitationEditor({ locale, item, onClose }: { locale: Locale; item?: BetaRecitation; onClose: () => void }) {
  const m = getBetaMessages(locale); const { state, mutate } = useBetaData();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim(); const content = String(form.get("content") ?? "").trim();
    if (!title || !content) return;
    mutate((draft) => {
      const values = { title, content, category: String(form.get("category") ?? ""), subjectId: String(form.get("subject") ?? "") || undefined,
        chapterId: String(form.get("chapter") ?? "") || undefined, updatedAt: new Date().toISOString() };
      if (item) { const record = draft.recitations.find((entry) => entry.id === item.id); if (record) Object.assign(record, values); }
      else draft.recitations.push({ ...nowEntity(uid("recitation"), draft.ownerId), ...values, status: "today", favorite: false,
        nextReviewAt: localDate(), reviewCount: 0, mastery: "new", type: "custom" });
    }); onClose();
  }
  return <Modal title={item ? m.edit : m.recitation.add} closeLabel={m.cancel} onClose={onClose}><form className="grid gap-4" onSubmit={submit}>
    <Field label={m.title}><input autoFocus required name="title" defaultValue={item?.title} className={fieldClass} /></Field>
    <Field label={m.subject}><select name="subject" className={fieldClass} defaultValue={item?.subjectId ?? ""}><option value="">—</option>{state.subjects.map((subject) => <option key={subject.id} value={subject.id}>{locale === "en" ? subject.nameEn : subject.name}</option>)}</select></Field>
    <Field label={m.chapter}><select name="chapter" className={fieldClass} defaultValue={item?.chapterId ?? ""}><option value="">—</option>{state.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{locale === "en" ? chapter.titleEn : chapter.title}</option>)}</select></Field>
    <Field label={m.category}><input name="category" defaultValue={item?.category} className={fieldClass} /></Field>
    <Field label={m.recitation.content}><textarea required name="content" defaultValue={item?.content} className={areaClass} /></Field>
    <Button type="submit">{m.save}</Button>
  </form></Modal>;
}
