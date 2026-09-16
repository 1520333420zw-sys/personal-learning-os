"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { getBetaMessages } from "@/i18n/beta-messages";
import { useBetaData } from "@/providers";
import { cn } from "@/lib/cn";
import { EmptyState, Field, fieldClass, localDate, nowEntity, uid } from "./shared";

export function QuestionEngine({ locale, subjectId, wrongOnly = false }: { locale: Locale; subjectId?: string; wrongOnly?: boolean }) {
  const m = getBetaMessages(locale); const { state, mutate } = useBetaData();
  const [chapterId, setChapterId] = useState("all"); const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]); const [submitted, setSubmitted] = useState(false);
  const wrongIds = useMemo(() => new Set(state.wrongQuestions.filter((w) => !w.mastered).map((w) => w.questionId)), [state.wrongQuestions]);
  const questions = useMemo(() => state.questions.filter((q) => (!subjectId || q.subjectId === subjectId) && (chapterId === "all" || q.chapterId === chapterId) && (!wrongOnly || wrongIds.has(q.id))), [state.questions, subjectId, chapterId, wrongOnly, wrongIds]);
  const question = questions[index % Math.max(1, questions.length)];
  const attempts = state.questionAttempts.filter((a) => !subjectId || state.questions.find((q) => q.id === a.questionId)?.subjectId === subjectId);
  const accuracy = attempts.length ? Math.round(attempts.filter((a) => a.correct).length / attempts.length * 100) : 0;
  const favorite = question ? state.favorites.some((f) => f.targetType === "question" && f.targetId === question.id) : false;
  const correct = question ? same(selected, question.answer) : false;
  const chapters = state.chapters.filter((c) => !subjectId || c.subjectId === subjectId);

  function choose(id: string) { if (!question || submitted) return; setSelected((current) => question.questionType === "multiple" ? (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]) : [id]); }
  function submit() {
    if (!question || !selected.length) return; const isCorrect = same(selected, question.answer); const now = new Date().toISOString();
    mutate((draft) => {
      draft.questionAttempts.unshift({ ...nowEntity(uid("attempt"), draft.ownerId), questionId: question.id, answer: selected, correct: isCorrect, attemptedAt: now });
      if (!isCorrect) {
        const existing = draft.wrongQuestions.find((w) => w.questionId === question.id);
        if (existing) { existing.mastered = false; existing.lastAttemptAt = now; existing.updatedAt = now; }
        else draft.wrongQuestions.push({ ...nowEntity(uid("wrong"), draft.ownerId), questionId: question.id, mastered: false, lastAttemptAt: now });
        if (!draft.reviewItems.some((r) => r.kind === "question" && r.targetId === question.id && r.status === "due")) draft.reviewItems.push({ ...nowEntity(uid("review"), draft.ownerId), kind: "question", targetId: question.id, title: question.stem, dueDate: localDate(), status: "due" });
      }
    }); setSubmitted(true);
  }
  function next() { setIndex((i) => i + 1); setSelected([]); setSubmitted(false); }
  function randomQuestion() { if (questions.length < 2) return; setIndex((current) => { let nextIndex = current; while (nextIndex % questions.length === current % questions.length) nextIndex = Math.floor(Math.random() * questions.length); return nextIndex; }); setSelected([]); setSubmitted(false); }
  function toggleFavorite() { if (!question) return; mutate((draft) => { const at = draft.favorites.findIndex((f) => f.targetType === "question" && f.targetId === question.id); if (at >= 0) draft.favorites.splice(at, 1); else draft.favorites.push({ ...nowEntity(uid("favorite"), draft.ownerId), targetType: "question", targetId: question.id }); }); }
  function markMastered() { if (!question) return; mutate((draft) => { const wrong = draft.wrongQuestions.find((w) => w.questionId === question.id); if (wrong) { wrong.mastered = true; wrong.updatedAt = new Date().toISOString(); } draft.reviewItems.filter((r) => r.kind === "question" && r.targetId === question.id).forEach((r) => { r.status = "mastered"; r.completedAt = new Date().toISOString(); }); }); next(); }

  return <section className="grid gap-5">
    <div className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between"><Field label={m.chapter} className="tablet:w-72"><select className={fieldClass} value={chapterId} onChange={(e) => { setChapterId(e.target.value); setIndex(0); setSelected([]); setSubmitted(false); }}><option value="all">{locale === "en" ? "All chapters" : "全部章节"}</option>{chapters.map((c) => <option key={c.id} value={c.id}>{locale === "en" ? c.titleEn : c.title}</option>)}</select></Field><div className="flex gap-2"><Badge variant="neutral">{m.questions.history} {attempts.length}</Badge><Badge variant="accent">{m.questions.accuracy} {accuracy}%</Badge></div></div>
    {!question ? <EmptyState>{m.empty}</EmptyState> : <Card variant="elevated" className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2"><Badge variant="warm">{m.questions.system}</Badge><Badge variant="neutral">{m.questions[question.questionType]}</Badge><span className="type-caption text-muted">{index % questions.length + 1} / {questions.length}</span></div>
      <h3 className="type-h3 text-primary">{question.stem}</h3>
      <div className="grid gap-3" role={question.questionType === "multiple" ? "group" : "radiogroup"}>{question.options.map((option) => { const on = selected.includes(option.id); const answer = submitted && question.answer.includes(option.id); const bad = submitted && on && !answer; return <button key={option.id} type="button" onClick={() => choose(option.id)} aria-pressed={on} className={cn("min-h-12 rounded-md border p-3 text-left type-body transition-colors", answer ? "border-success bg-success-soft" : bad ? "border-error bg-error-soft" : on ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-border-strong")}>{option.id.toUpperCase()}. {option.text}</button>; })}</div>
      {submitted ? <div className={cn("rounded-md border p-4", correct ? "border-success bg-success-soft" : "border-error bg-error-soft")} aria-live="polite"><p className="type-label text-primary">{correct ? m.questions.correct : m.questions.incorrect}</p><p className="type-small mt-2 text-secondary">{m.questions.answer}: {question.answer.map((id) => question.options.find((o) => o.id === id)?.text).join("、")}</p><p className="type-small mt-2 text-secondary">{m.questions.explanation}: {question.explanation}</p></div> : null}
      <div className="flex flex-wrap gap-2">{!submitted ? <Button onClick={submit} disabled={!selected.length}>{m.questions.submit}</Button> : <><Button onClick={next}>{m.questions.next}</Button><Button variant="secondary" onClick={() => { setSelected([]); setSubmitted(false); }}>{m.questions.retry}</Button>{wrongIds.has(question.id) ? <Button variant="secondary" onClick={markMastered}>{m.questions.mastered}</Button> : null}</>}<Button variant="secondary" onClick={randomQuestion} disabled={questions.length < 2}>{m.questions.random}</Button><Button variant="ghost" onClick={toggleFavorite}>{favorite ? `★ ${m.favorited}` : `☆ ${m.favorite}`}</Button></div>
    </Card>}
  </section>;
}

function same(a: string[], b: string[]) { return a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index]); }
