"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Card } from "@/components/ui";
import type { BetaVocabulary } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { areaClass, EmptyState, Field, fieldClass, localDate, Modal, nowEntity, Tabs, uid } from "./shared";

const labels = {
  "zh-CN": { add: "添加单词", search: "搜索单词", all: "今日单词", review: "今日复习", favorite: "收藏", mastered: "已掌握", know: "认识", vague: "模糊", unknown: "不认识", word: "单词", phonetic: "音标", meaning: "中文释义", example: "例句", save: "保存", close: "关闭", empty: "当前考试分类下还没有符合条件的单词。" },
  en: { add: "Add word", search: "Search words", all: "Today's words", review: "Due reviews", favorite: "Favorites", mastered: "Mastered", know: "Know", vague: "Vague", unknown: "Don't know", word: "Word", phonetic: "Phonetic", meaning: "Meaning", example: "Example", save: "Save", close: "Close", empty: "No matching words in this exam category." },
};

export function EnglishVocabulary({ locale, exam }: { locale: Locale; exam: BetaVocabulary["examType"] }) {
  const l = labels[locale]; const { state, mutate } = useBetaData(); const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState(""); const [open, setOpen] = useState(false); const today = localDate();
  const words = state.vocabulary.filter((word) => word.examType === exam && `${word.word} ${word.meaning}`.toLowerCase().includes(query.toLowerCase()) &&
    (filter === "all" || filter === "review" && !!word.nextReviewAt && word.nextReviewAt <= today || filter === "favorite" && word.favorite || filter === "mastered" && word.familiarity === "mastered"));
  function rate(word: BetaVocabulary, value: "known" | "vague" | "new") {
    mutate((draft) => {
      const record = draft.vocabulary.find((item) => item.id === word.id); if (!record) return;
      const count = record.reviewCount + 1; const familiarity = value === "known" && count >= 3 ? "mastered" : value;
      const next = new Date(); next.setDate(next.getDate() + (value === "new" ? 0 : value === "vague" ? 1 : 7));
      const nextReviewAt = familiarity === "mastered" ? undefined : localDate(next);
      Object.assign(record, { familiarity, reviewCount: count, lastReviewedAt: new Date().toISOString(), nextReviewAt, updatedAt: new Date().toISOString() });
      draft.reviewItems = draft.reviewItems.filter((item) => !(item.kind === "vocabulary" && item.targetId === word.id && item.status === "due"));
      if (nextReviewAt) draft.reviewItems.push({ ...nowEntity(uid("review"), draft.ownerId), kind: "vocabulary", targetId: word.id, title: word.word, dueDate: nextReviewAt, status: "due" });
    });
  }
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const word = String(form.get("word") ?? "").trim(); const meaning = String(form.get("meaning") ?? "").trim();
    if (!word || !meaning) return;
    mutate((draft) => draft.vocabulary.push({ ...nowEntity(uid("word"), draft.ownerId), word, meaning,
      phonetic: String(form.get("phonetic") ?? ""), example: String(form.get("example") ?? ""), examType: exam,
      familiarity: "new", favorite: false, reviewCount: 0, nextReviewAt: today })); setOpen(false);
  }
  return <section className="grid gap-4"><div className="flex flex-wrap items-end justify-between gap-3"><Field label={l.search} className="min-w-52 flex-1"><input className={fieldClass} value={query} onChange={(event) => setQuery(event.target.value)} /></Field><Button onClick={() => setOpen(true)}>{l.add}</Button></div>
    <Tabs label={l.word} value={filter} onChange={setFilter} items={(["all", "review", "favorite", "mastered"] as const).map((id) => ({ id, label: l[id] }))} />
    <div className="grid gap-3 tablet:grid-cols-2">{words.length ? words.map((word) => <Card key={word.id} padding="sm"><div className="flex justify-between gap-2"><div><h2 className="type-h3 text-primary">{word.word}</h2><p className="type-caption mt-1 text-muted">{word.phonetic}</p></div><Button size="sm" variant="ghost" onClick={() => mutate((draft) => { const record = draft.vocabulary.find((item) => item.id === word.id); if (record) record.favorite = !record.favorite; })}>{word.favorite ? "★" : "☆"} {l.favorite}</Button></div><p className="type-body mt-3 text-secondary">{word.meaning}</p><p className="type-small mt-2 text-muted">{word.example}</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => rate(word, "known")}>{l.know}</Button><Button size="sm" variant="secondary" onClick={() => rate(word, "vague")}>{l.vague}</Button><Button size="sm" variant="secondary" onClick={() => rate(word, "new")}>{l.unknown}</Button>{word.nextReviewAt ? <Badge variant="neutral">{word.nextReviewAt}</Badge> : null}</div></Card>) : <EmptyState>{l.empty}</EmptyState>}</div>
    {open ? <Modal title={l.add} closeLabel={l.close} onClose={() => setOpen(false)}><form onSubmit={add} className="grid gap-4"><Field label={l.word}><input autoFocus required name="word" className={fieldClass} /></Field><Field label={l.phonetic}><input name="phonetic" className={fieldClass} /></Field><Field label={l.meaning}><input required name="meaning" className={fieldClass} /></Field><Field label={l.example}><textarea name="example" className={areaClass} /></Field><Button type="submit">{l.save}</Button></form></Modal> : null}
  </section>;
}
