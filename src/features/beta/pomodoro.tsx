"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { getBetaMessages } from "@/i18n/beta-messages";
import { useBetaData } from "@/providers";
import { cn } from "@/lib/cn";
import { Field, fieldClass, nowEntity, uid } from "./shared";

function format(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }

export function PomodoroPanel({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const m = getBetaMessages(locale); const { state, mutate } = useBetaData(); const router = useRouter();
  const runtime = state.pomodoroRuntime;
  const [subjectId, setSubjectId] = useState(runtime?.subjectId ?? state.subjects[0]?.id ?? "");
  const [duration, setDuration] = useState(String(runtime?.durationMinutes ?? 25));
  const [remaining, setRemaining] = useState(runtime?.remainingSeconds ?? 25 * 60);
  const [announcement, setAnnouncement] = useState("");
  const active = Boolean(runtime);
  const durationNumber = Number(duration);
  const valid = Number.isInteger(durationNumber) && durationNumber >= 5 && durationNumber <= 180;

  const finish = useCallback((automatic = false) => {
    if (!runtime) return;
    const end = new Date();
    const currentRemaining = runtime.status === "running" && runtime.targetEndAt
      ? Math.max(0, Math.ceil((new Date(runtime.targetEndAt).getTime() - Date.now()) / 1000))
      : runtime.remainingSeconds;
    const elapsed = automatic ? runtime.durationMinutes : Math.max(0, Math.floor((runtime.durationMinutes * 60 - currentRemaining) / 60));
    mutate((draft) => {
      draft.studySessions.unshift({ ...nowEntity(uid("session"), draft.ownerId), subjectId: runtime.subjectId, taskId: runtime.taskId, startedAt: runtime.startedAt, endedAt: end.toISOString(), durationMinutes: elapsed, sessionType: "learning", completed: true });
      draft.pomodoroSessions.unshift({ ...nowEntity(uid("pomodoro"), draft.ownerId), subjectId: runtime.subjectId, taskId: runtime.taskId, startedAt: runtime.startedAt, endedAt: end.toISOString(), durationMinutes: elapsed, completed: true });
      if (runtime.taskId) { const task = draft.tasks.find((item) => item.id === runtime.taskId); if (task) { task.actualMinutes += elapsed; task.updatedAt = end.toISOString(); } }
      delete draft.pomodoroRuntime;
    });
    setRemaining(runtime.durationMinutes * 60); setAnnouncement(m.focus.saved); router.refresh();
  }, [runtime, mutate, m.focus.saved, router]);

  useEffect(() => {
    if (!runtime) return;
    const sync = () => {
      if (runtime.status !== "running" || !runtime.targetEndAt) { setRemaining(runtime.remainingSeconds); return; }
      const next = Math.max(0, Math.ceil((new Date(runtime.targetEndAt).getTime() - Date.now()) / 1000));
      setRemaining(next); if (next === 0) finish(true);
    };
    const initialTimer = window.setTimeout(() => {
      setSubjectId(runtime.subjectId ?? ""); setDuration(String(runtime.durationMinutes)); sync();
    }, 0);
    const timer = window.setInterval(sync, 500); document.addEventListener("visibilitychange", sync);
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer); document.removeEventListener("visibilitychange", sync); };
  }, [runtime, finish]);

  function start() {
    if (!valid) return; const started = new Date(); const seconds = durationNumber * 60;
    mutate((draft) => { draft.pomodoroRuntime = { id: uid("pomodoro"), subjectId: subjectId || undefined, durationMinutes: durationNumber, startedAt: started.toISOString(), targetEndAt: new Date(started.getTime() + seconds * 1000).toISOString(), remainingSeconds: seconds, status: "running" }; });
    setRemaining(seconds); setAnnouncement("");
  }
  function pause() {
    if (!runtime?.targetEndAt) return; const next = Math.max(0, Math.ceil((new Date(runtime.targetEndAt).getTime() - Date.now()) / 1000));
    mutate((draft) => { if (draft.pomodoroRuntime) { draft.pomodoroRuntime.status = "paused"; draft.pomodoroRuntime.remainingSeconds = next; delete draft.pomodoroRuntime.targetEndAt; } });
  }
  function resume() { if (!runtime) return; mutate((draft) => { if (draft.pomodoroRuntime) { draft.pomodoroRuntime.status = "running"; draft.pomodoroRuntime.targetEndAt = new Date(Date.now() + draft.pomodoroRuntime.remainingSeconds * 1000).toISOString(); } }); }
  function reset() { mutate((draft) => { delete draft.pomodoroRuntime; }); setRemaining(valid ? durationNumber * 60 : 0); setAnnouncement(""); }

  return <Card variant="elevated" className={cn("grid gap-7", !compact && "tablet:grid-cols-[1fr_1.2fr] tablet:items-center")}>
    <div><div className="flex items-center justify-between gap-3"><Badge variant={runtime?.status === "running" ? "accent" : "neutral"}>{runtime?.status === "running" ? m.focus.running : runtime?.status === "paused" ? m.focus.paused : m.focus.idle}</Badge><span className="type-caption text-muted">{durationNumber || 0} {m.minutes}</span></div><p className="mt-5 tabular-nums text-5xl font-semibold tracking-[-.04em] text-primary" aria-label={format(remaining)}>{format(remaining)}</p><p className="type-small mt-3 min-h-6 text-secondary" aria-live="polite">{announcement}</p></div>
    <div className="grid gap-4">
      <Field label={m.subject}><select className={fieldClass} value={subjectId} disabled={active} onChange={(e) => setSubjectId(e.target.value)}>{state.subjects.map((s) => <option key={s.id} value={s.id}>{locale === "en" ? s.nameEn : s.name}</option>)}</select></Field>
      <Field label={m.focus.duration}><div className="grid grid-cols-4 gap-2">{[25,45,60].map((n) => <button type="button" key={n} disabled={active} onClick={() => { setDuration(String(n)); setRemaining(n * 60); }} className={cn("min-h-11 rounded-md border type-small", duration === String(n) ? "border-accent bg-accent-soft" : "border-border bg-surface")}>{n}</button>)}<input aria-label={m.focus.custom} disabled={active} className={`${fieldClass} px-2 text-center`} type="number" min="5" max="180" value={duration} onChange={(e) => { setDuration(e.target.value); const n = Number(e.target.value); setRemaining(Number.isFinite(n) ? n * 60 : 0); }} /></div></Field>
      {!valid ? <p className="type-small text-error">5–180 {m.minutes}</p> : null}
      <div className="grid grid-cols-2 gap-2">{!runtime ? <Button onClick={start} disabled={!valid}>{m.focus.start}</Button> : runtime.status === "running" ? <Button onClick={pause}>{m.focus.pause}</Button> : <Button onClick={resume}>{m.focus.resume}</Button>}<Button variant="secondary" onClick={() => finish(false)} disabled={!runtime}>{m.focus.finish}</Button><Button variant="ghost" className="col-span-2" onClick={reset}>{m.focus.reset}</Button></div>
    </div>
  </Card>;
}
