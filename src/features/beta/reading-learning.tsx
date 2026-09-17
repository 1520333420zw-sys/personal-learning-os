"use client";

import { useState, type FormEvent } from "react";
import { Button, Card } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { areaClass, Field, fieldClass, localDate, nowEntity, uid } from "./shared";

export function ReadingLearning({ locale }: { locale: Locale }) {
  const { state, mutate } = useBetaData(); const [active, setActive] = useState("");
  const l = locale === "en" ? { title: "Learn from saved articles", select: "Article", word: "Word", meaning: "Meaning", expression: "Expression to recite", addWord: "Add to vocabulary", addExpression: "Add to recitation", noItems: "Save an article above to extract your own words and expressions." } : { title: "从外刊积累", select: "文章", word: "单词", meaning: "释义", expression: "要背诵的表达", addWord: "加入单词", addExpression: "加入背诵", noItems: "先保存文章，再整理自己的生词和表达。" };
  function addWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const word = String(form.get("word") ?? "").trim(); const meaning = String(form.get("meaning") ?? "").trim();
    if (!word || !meaning || !active) return;
    mutate((draft) => { if (draft.vocabulary.some((item) => item.word.toLowerCase() === word.toLowerCase())) return;
      draft.vocabulary.push({ ...nowEntity(uid("word"), draft.ownerId), word, meaning, phonetic: "", example: "",
        examType: "general", familiarity: "new", favorite: false, reviewCount: 0, nextReviewAt: localDate(), tags: ["reading"] }); });
    event.currentTarget.reset();
  }
  function addExpression(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const content = String(form.get("content") ?? "").trim();
    if (!content || !active) return;
    mutate((draft) => { draft.recitations.push({ ...nowEntity(uid("recitation"), draft.ownerId), title: content.slice(0, 60),
      content, category: draft.reading.find((item) => item.id === active)?.title ?? "", status: "today", favorite: false,
      nextReviewAt: localDate(), subjectId: draft.subjects.find((item) => item.slug === "english")?.id,
      type: "expression", reviewCount: 0, mastery: "new" }); }); event.currentTarget.reset();
  }
  return <section className="page-container mt-8"><Card><h2 className="type-h2 text-primary">{l.title}</h2>{state.reading.length ? <div className="mt-4 grid gap-5"><Field label={l.select}><select className={fieldClass} value={active} onChange={(event) => setActive(event.target.value)}><option value="">—</option>{state.reading.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}</select></Field><div className="grid gap-5 tablet:grid-cols-2"><form onSubmit={addWord} className="grid gap-3"><Field label={l.word}><input name="word" required className={fieldClass} /></Field><Field label={l.meaning}><input name="meaning" required className={fieldClass} /></Field><Button type="submit" disabled={!active}>{l.addWord}</Button></form><form onSubmit={addExpression} className="grid gap-3"><Field label={l.expression}><textarea name="content" required className={areaClass} /></Field><Button type="submit" disabled={!active}>{l.addExpression}</Button></form></div></div> : <p className="type-small mt-3 text-secondary">{l.noItems}</p>}</Card></section>;
}
