"use client";

import Link from "next/link";
import { Card, SectionHeader } from "@/components/ui";
import type { BetaState, BetaStudySession } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { getBetaMessages } from "@/i18n/beta-messages";
import { useBetaData } from "@/providers";
import { BetaPage, EmptyState, localDate } from "./shared";

function sessionDate(session: BetaStudySession) {
  return localDate(new Date(session.endedAt));
}

function subjectName(state: BetaState, subjectId: string | undefined, locale: Locale, fallback: string) {
  const subject = state.subjects.find((item) => item.id === subjectId);
  return subject ? (locale === "en" ? subject.nameEn : subject.name) : fallback;
}

function chapterName(state: BetaState, chapterId: string | undefined, locale: Locale, fallback: string) {
  const chapter = state.chapters.find((item) => item.id === chapterId);
  return chapter ? (locale === "en" ? chapter.titleEn : chapter.title) : fallback;
}

function completedSessions(state: BetaState) {
  return state.studySessions.filter((session) => session.completed).sort((a, b) => b.endedAt.localeCompare(a.endedAt));
}

export function TodayStudySummary({ locale }: { locale: Locale }) {
  const m = getBetaMessages(locale).history;
  const { state } = useBetaData();
  const today = localDate();
  const sessions = completedSessions(state).filter((session) => sessionDate(session) === today);
  const totalMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
  const minutesBySubject = new Map<string, number>();
  for (const session of sessions) {
    const key = session.subjectId ?? "unassigned";
    minutesBySubject.set(key, (minutesBySubject.get(key) ?? 0) + session.durationMinutes);
  }

  return <section aria-labelledby="today-study-title">
    <SectionHeader titleId="today-study-title" title={m.today} action={<Link href={`/${locale}/history`} className="type-label inline-flex min-h-11 items-center text-accent hover:underline">{m.viewAll} →</Link>}/>
    <Card className="mt-5" padding="sm">
      <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
        <div><p className="type-caption text-muted">{m.totalMinutes}</p><p className="type-h2 mt-1 text-primary">{totalMinutes} <span className="type-small font-normal">{getBetaMessages(locale).minutes}</span></p></div>
        <div><p className="type-caption text-muted">{m.sessionCount}</p><p className="type-h2 mt-1 text-primary">{sessions.length}</p></div>
      </div>
      <div className="mt-4"><p className="type-label text-primary">{m.bySubject}</p>{minutesBySubject.size ? <div className="mt-3 flex flex-wrap gap-2">{[...minutesBySubject].map(([id, minutes]) => <span key={id} className="rounded-md bg-surface-muted px-3 py-2 type-small text-secondary">{subjectName(state, id === "unassigned" ? undefined : id, locale, m.unassigned)} · {minutes} {getBetaMessages(locale).minutes}</span>)}</div> : <p className="type-small mt-3 text-muted">{m.noRecords}</p>}</div>
    </Card>
  </section>;
}

export function StudyHistoryPage({ locale }: { locale: Locale }) {
  const m = getBetaMessages(locale).history;
  const { state } = useBetaData();
  const sessions = completedSessions(state);
  const totalMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);

  return <BetaPage title={m.title} description={m.subtitle}>
    <div className="grid grid-cols-2 gap-3 tablet:max-w-xl"><Card padding="sm"><p className="type-caption text-muted">{m.totalMinutes}</p><p className="type-h2 mt-1 text-primary">{totalMinutes} <span className="type-small font-normal">{getBetaMessages(locale).minutes}</span></p></Card><Card padding="sm"><p className="type-caption text-muted">{m.sessionCount}</p><p className="type-h2 mt-1 text-primary">{sessions.length}</p></Card></div>
    <section aria-labelledby="study-history-list"><SectionHeader titleId="study-history-list" title={m.recent}/><div className="mt-5">{sessions.length ? <SessionList sessions={sessions} state={state} locale={locale}/> : <EmptyState>{m.noRecords}</EmptyState>}</div></section>
  </BetaPage>;
}

export function SubjectStudySummary({ locale, subjectId }: { locale: Locale; subjectId: string }) {
  const m = getBetaMessages(locale).history;
  const { state } = useBetaData();
  const sessions = completedSessions(state).filter((session) => session.subjectId === subjectId);
  const totalMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);

  return <section aria-labelledby={`subject-study-${subjectId}`}><SectionHeader titleId={`subject-study-${subjectId}`} title={m.cumulative} action={<Link href={`/${locale}/history`} className="type-label inline-flex min-h-11 items-center text-accent hover:underline">{m.viewAll} →</Link>}/><Card className="mt-5" padding="sm"><div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-4"><div><p className="type-caption text-muted">{m.totalMinutes}</p><p className="type-h3 mt-1 text-primary">{totalMinutes} {getBetaMessages(locale).minutes}</p></div><div><p className="type-caption text-muted">{m.sessionCount}</p><p className="type-h3 mt-1 text-primary">{sessions.length}</p></div></div>{sessions.length ? <div className="mt-4"><SessionList sessions={sessions.slice(0, 3)} state={state} locale={locale} compact/></div> : <p className="type-small mt-4 text-muted">{m.noRecords}</p>}</Card></section>;
}

function SessionList({ sessions, state, locale, compact = false }: { sessions: BetaStudySession[]; state: BetaState; locale: Locale; compact?: boolean }) {
  const m = getBetaMessages(locale).history;
  return <ol className="grid gap-3">{sessions.map((session) => <li key={session.id} className={compact ? "border-b border-border pb-3 last:border-0 last:pb-0" : "rounded-lg border border-border bg-surface p-4"}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="type-label text-primary">{subjectName(state, session.subjectId, locale, m.unassigned)}</p><p className="type-small mt-1 text-secondary">{chapterName(state, session.chapterId, locale, m.noChapter)}</p></div><time className="type-caption text-muted" dateTime={sessionDate(session)}>{sessionDate(session)}</time></div>
    <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 type-caption text-secondary"><div><dt className="inline text-muted">{m.type}: </dt><dd className="inline">{m[session.sessionType]}</dd></div><div><dt className="inline text-muted">{m.duration}: </dt><dd className="inline">{session.durationMinutes} {getBetaMessages(locale).minutes}</dd></div>{session.itemCount !== undefined ? <div><dt className="inline text-muted">{m.items}: </dt><dd className="inline">{session.itemCount}</dd></div> : null}{session.incorrectCount !== undefined ? <div><dt className="inline text-muted">{m.incorrect}: </dt><dd className="inline">{session.incorrectCount}</dd></div> : null}</dl>
  </li>)}</ol>;
}
