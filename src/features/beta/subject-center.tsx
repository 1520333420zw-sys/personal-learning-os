"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import type { Mastery } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { getBetaMessages } from "@/i18n/beta-messages";
import { useBetaData } from "@/providers";
import { cn } from "@/lib/cn";
import { areaClass, BetaPage, EmptyState, Field, localDate, nowEntity, Tabs, uid } from "./shared";
import { QuestionEngine } from "./question-engine";

type CenterTab = "learn" | "map" | "practice" | "wrong" | "review";

export function SubjectCenter({ locale, slug }: { locale: Locale; slug: "psychology" | "politics" }) {
  const m = getBetaMessages(locale); const { state, mutate } = useBetaData();
  const subject = state.subjects.find((s) => s.slug === slug)!; const chapters = state.chapters.filter((c) => c.subjectId === subject.id).sort((a,b) => a.order-b.order);
  const points = state.knowledgePoints.filter((p) => p.subjectId === subject.id);
  const [tab, setTab] = useState<CenterTab>("learn"); const [chapterId, setChapterId] = useState(chapters[0]?.id ?? "");
  const [newsFilter, setNewsFilter] = useState("today");
  const [pointId, setPointId] = useState(points.find((p) => p.chapterId === chapterId)?.id ?? points[0]?.id ?? "");
  const selected = points.find((p) => p.id === pointId);
  const due = state.reviewItems.filter((r) => r.kind === "knowledge" && r.status === "due" && points.some((p) => p.id === r.targetId));
  const progress = points.length ? Math.round(points.filter((p) => p.mastery === "mastered").length / points.length * 100) : 0;
  const title = locale === "en" ? subject.nameEn : subject.name;
  const tabs = ["learn","map","practice","wrong","review"].map((id) => ({ id, label: m.subjectCenter[id as CenterTab] }));

  function openPoint(id: string) { setPointId(id); setTab("learn"); }
  function updatePoint(field: "personalNote" | "mastery" | "favorite", value: string | boolean) { if (!selected) return; mutate((draft) => { const point = draft.knowledgePoints.find((p) => p.id === selected.id); if (!point) return; if (field === "favorite") point.favorite = Boolean(value); else if (field === "mastery") point.mastery = value as Mastery; else point.personalNote = String(value); point.lastStudiedAt = new Date().toISOString(); point.updatedAt = new Date().toISOString(); if (field === "mastery") { const percent = { new: 0, learning: 35, reviewing: 70, mastered: 100 }[value as Mastery]; const existing = draft.studyProgress.find((p) => p.targetType === "knowledge" && p.targetId === point.id); if (existing) { existing.status = value as Mastery; existing.percent = percent; existing.updatedAt = point.updatedAt; } else draft.studyProgress.push({ ...nowEntity(uid("progress"), draft.ownerId), targetType: "knowledge", targetId: point.id, status: value as Mastery, percent }); } if (field === "mastery" && value === "reviewing" && !draft.reviewItems.some((r) => r.kind === "knowledge" && r.targetId === point.id && r.status === "due")) draft.reviewItems.push({ ...nowEntity(uid("review"), draft.ownerId), kind: "knowledge", targetId: point.id, title: point.title, dueDate: localDate(), status: "due" }); }); }
  function createLinkedNote() { if (!selected) return; mutate((draft) => { if (!draft.notes.some((note) => note.linkedType === "knowledge" && note.linkedId === selected.id)) draft.notes.push({ ...nowEntity(uid("note"), draft.ownerId), title: locale === "en" ? selected.titleEn : selected.title, content: selected.personalNote, tags: [slug], subjectId: subject.id, linkedType: "knowledge", linkedId: selected.id, favorite: false }); }); }

  return <BetaPage title={title} description={`${m.subjectCenter.learn} · ${chapters.length} ${m.chapter} · ${progress}% ${m.subjectCenter.mastered}`}>
    <Tabs label={m.subjectCenter.learn} items={tabs} value={tab} onChange={(id) => setTab(id as CenterTab)} />
    {tab === "learn" ? <div className="grid gap-6 desktop:grid-cols-[18rem_minmax(0,1fr)]">
      <Card padding="sm" className="self-start"><h2 className="type-h3 text-primary">{m.chapter}</h2><div className="mt-4 grid gap-2">{chapters.map((c) => <button key={c.id} type="button" onClick={() => { setChapterId(c.id); const first = points.find((p) => p.chapterId === c.id); if (first) setPointId(first.id); }} className={cn("min-h-11 rounded-md px-3 text-left type-small", chapterId === c.id ? "bg-accent-soft text-primary" : "text-secondary hover:bg-surface-muted")}>{locale === "en" ? c.titleEn : c.title}<span className="ml-2 text-muted">({points.filter((p) => p.chapterId === c.id).length})</span></button>)}</div></Card>
      <div className="grid gap-5">{points.filter((p) => p.chapterId === chapterId).length ? <><div className="flex flex-wrap gap-2">{points.filter((p) => p.chapterId === chapterId).map((p) => <button key={p.id} type="button" onClick={() => setPointId(p.id)} className={cn("min-h-11 rounded-md border px-3 type-small", pointId === p.id ? "border-accent bg-accent-soft" : "border-border bg-surface")}>{locale === "en" ? p.titleEn : p.title}</button>)}</div>{selected ? <Card variant="elevated" className="grid gap-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="type-h2 text-primary">{locale === "en" ? selected.titleEn : selected.title}</h2><p className="type-caption mt-2 text-muted">{selected.lastStudiedAt ? `${m.subjectCenter.lastStudy}: ${new Intl.DateTimeFormat(locale).format(new Date(selected.lastStudiedAt))}` : m.subjectCenter.new}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={createLinkedNote}>{m.knowledge.add}</Button><Button variant="ghost" onClick={() => updatePoint("favorite", !selected.favorite)}>{selected.favorite ? `★ ${m.favorited}` : `☆ ${m.favorite}`}</Button></div></div><Info title={m.subjectCenter.core}>{selected.coreConcept}</Info><Info title={m.subjectCenter.key}>{selected.keyPoints}</Info><Info title={m.subjectCenter.pitfalls}>{selected.pitfalls}</Info><Field label={m.subjectCenter.mastery}><select className="min-h-11 rounded-md border border-border-strong bg-surface px-3" value={selected.mastery} onChange={(e) => updatePoint("mastery", e.target.value)}>{(["new","learning","reviewing","mastered"] as const).map((v) => <option key={v} value={v}>{m.subjectCenter[v]}</option>)}</select></Field><Field label={m.subjectCenter.ownNote}><textarea className={areaClass} key={selected.id} defaultValue={selected.personalNote} onBlur={(e) => updatePoint("personalNote", e.target.value)} /></Field></Card> : null}</> : <EmptyState>{m.empty}</EmptyState>}</div>
    </div> : null}
    {tab === "map" ? <MindMap locale={locale} chapters={chapters} points={points} onOpen={openPoint} /> : null}
    {tab === "practice" ? <QuestionEngine locale={locale} subjectId={subject.id} /> : null}
    {tab === "wrong" ? <QuestionEngine locale={locale} subjectId={subject.id} wrongOnly /> : null}
    {tab === "review" ? <div className="grid gap-3">{due.length ? due.map((r) => <Card key={r.id} padding="sm"><div className="flex items-center justify-between gap-3"><p className="type-label text-primary">{r.title}</p><Button size="sm" onClick={() => mutate((draft) => { const item = draft.reviewItems.find((x) => x.id === r.id); if (item) { item.status = "completed"; item.completedAt = new Date().toISOString(); } })}>{locale === "en" ? "Complete" : "完成复习"}</Button></div></Card>) : <EmptyState>{m.empty}</EmptyState>}</div> : null}
    {slug === "politics" ? <Card variant="muted"><h2 className="type-h3 text-primary">{m.news.title}</h2><div className="mt-4"><Tabs label={m.news.title} value={newsFilter} onChange={setNewsFilter} items={(["today","china","world","economy","technology","education","politics"] as const).map((id)=>({id,label:m.news[id]}))}/></div><p className="type-body mt-5 text-secondary">{m.dashboard.noNews}</p><p className="type-small mt-2 text-muted">{m.dashboard.newsHelp}</p></Card> : null}
  </BetaPage>;
}

function Info({ title, children }: { title: string; children: string }) { return <div><h3 className="type-label text-primary">{title}</h3><p className="type-body mt-2 whitespace-pre-wrap text-secondary">{children}</p></div>; }
function MindMap({ locale, chapters, points, onOpen }: { locale: Locale; chapters: ReturnType<typeof useBetaData>["state"]["chapters"]; points: ReturnType<typeof useBetaData>["state"]["knowledgePoints"]; onOpen: (id: string) => void }) {
  const [open, setOpen] = useState<string[]>(chapters.slice(0, 1).map((c) => c.id));
  return <Card><div className="grid gap-3">{chapters.map((chapter) => { const expanded = open.includes(chapter.id); return <div key={chapter.id} className="rounded-md border border-border bg-surface-muted p-3"><button type="button" className="flex min-h-11 w-full items-center justify-between text-left type-label text-primary" onClick={() => setOpen((current) => expanded ? current.filter((id) => id !== chapter.id) : [...current, chapter.id])}><span>{locale === "en" ? chapter.titleEn : chapter.title}</span><span>{expanded ? "−" : "+"}</span></button>{expanded ? <div className="ml-3 mt-2 grid gap-2 border-l border-border-strong pl-4">{points.filter((p) => p.chapterId === chapter.id).map((p) => <button key={p.id} type="button" onClick={() => onOpen(p.id)} className="flex min-h-10 items-center justify-between rounded-md bg-surface px-3 text-left type-small text-secondary hover:text-primary"><span>{locale === "en" ? p.titleEn : p.title}</span><Badge variant={p.mastery === "mastered" ? "success" : p.mastery === "reviewing" ? "warm" : "neutral"}>{p.mastery}</Badge></button>)}</div> : null}</div>; })}</div></Card>;
}
