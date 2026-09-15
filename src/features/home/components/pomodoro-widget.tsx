"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge, Button, Card, Input, SectionHeader } from "@/components/ui";
import type { PomodoroSession, PomodoroStatus, StudyCategory } from "@/domain";
import type { HomeMessages } from "@/i18n";
import { cn } from "@/lib/cn";

import type { HomeSubjectViewModel } from "../types";

type DurationChoice = 25 | 45 | 60 | "custom";

/** Boundary for a future persistence service that creates StudySession records. */
export interface PomodoroCompletion {
  subjectId: string | "custom";
  durationMinutes: number;
  pomodoro: Pick<
    PomodoroSession,
    "category" | "startedAt" | "endsAt" | "status"
  >;
}

interface PomodoroWidgetProps {
  subjects: readonly HomeSubjectViewModel[];
  messages: HomeMessages;
  onComplete?: (completion: PomodoroCompletion) => void;
}

const durationChoices = [25, 45, 60] as const;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PomodoroWidget({
  subjects,
  messages,
  onComplete,
}: PomodoroWidgetProps) {
  const copy = messages.pomodoro;
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "custom");
  const [durationChoice, setDurationChoice] = useState<DurationChoice>(25);
  const [customDuration, setCustomDuration] = useState("30");
  const [status, setStatus] = useState<PomodoroStatus>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const targetEndRef = useRef<number | null>(null);
  const startedAtRef = useRef<string | null>(null);

  const durationMinutes = durationChoice === "custom"
    ? Number(customDuration)
    : durationChoice;
  const customDurationValid = Number.isInteger(durationMinutes)
    && durationMinutes >= 5
    && durationMinutes <= 180;
  const controlsLocked = status === "running" || status === "paused";

  const complete = useCallback(() => {
    const completedAt = new Date().toISOString();
    targetEndRef.current = null;
    setRemainingSeconds(0);
    setStatus("completed");
    onComplete?.({
      subjectId,
      durationMinutes,
      pomodoro: {
        category: subjectCategory(subjectId),
        startedAt: startedAtRef.current ?? completedAt,
        endsAt: completedAt,
        status: "completed",
      },
    });
  }, [durationMinutes, onComplete, subjectId]);

  const syncRemainingTime = useCallback(() => {
    if (targetEndRef.current === null) return;
    const nextRemaining = Math.max(
      0,
      Math.ceil((targetEndRef.current - Date.now()) / 1000),
    );
    setRemainingSeconds(nextRemaining);
    if (nextRemaining === 0) complete();
  }, [complete]);

  useEffect(() => {
    if (status !== "running") return;
    syncRemainingTime();
    const intervalId = window.setInterval(syncRemainingTime, 250);
    const handleVisibilityChange = () => syncRemainingTime();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, syncRemainingTime]);

  const statusLabel = useMemo(() => {
    if (status === "running") return copy.running;
    if (status === "paused") return copy.paused;
    if (status === "completed") return copy.completed;
    return copy.idle;
  }, [copy, status]);

  function start() {
    if (!customDurationValid) return;
    const seconds = durationMinutes * 60;
    startedAtRef.current = new Date().toISOString();
    setRemainingSeconds(seconds);
    targetEndRef.current = Date.now() + seconds * 1000;
    setStatus("running");
  }

  function pause() {
    if (status !== "running" || targetEndRef.current === null) return;
    setRemainingSeconds(
      Math.max(0, Math.ceil((targetEndRef.current - Date.now()) / 1000)),
    );
    targetEndRef.current = null;
    setStatus("paused");
  }

  function resume() {
    if (status !== "paused" || remainingSeconds <= 0) return;
    targetEndRef.current = Date.now() + remainingSeconds * 1000;
    setStatus("running");
  }

  function reset() {
    targetEndRef.current = null;
    startedAtRef.current = null;
    setRemainingSeconds(customDurationValid ? durationMinutes * 60 : 0);
    setStatus("idle");
  }

  function chooseDuration(choice: DurationChoice) {
    setDurationChoice(choice);
    const minutes = choice === "custom" ? Number(customDuration) : choice;
    setRemainingSeconds(
      Number.isInteger(minutes) && minutes >= 5 && minutes <= 180
        ? minutes * 60
        : 0,
    );
    setStatus("idle");
  }

  return (
    <section aria-labelledby="pomodoro-title">
      <SectionHeader
        titleId="pomodoro-title"
        title={messages.sections.pomodoro}
        description={messages.sections.pomodoroDescription}
      />
      <Card className="mt-5" padding="md" variant="elevated">
        <div className="grid min-w-0 gap-6 tablet:grid-cols-[minmax(0,1fr)_minmax(14rem,0.8fr)] tablet:items-center">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <Badge variant={status === "running" ? "accent" : status === "completed" ? "success" : "neutral"}>
                {statusLabel}
              </Badge>
              <span className="type-caption text-muted">{durationMinutes || 0} {copy.minutes}</span>
            </div>
            <p
              className="mt-5 tabular-nums text-5xl font-semibold tracking-[-0.045em] text-primary tablet:text-6xl"
              aria-label={formatTime(remainingSeconds)}
            >
              {formatTime(remainingSeconds)}
            </p>
            <p aria-live="polite" className="type-small mt-3 min-h-6 text-secondary">
              {status === "completed" ? copy.completionAnnouncement : statusLabel}
            </p>
          </div>

          <div className="grid min-w-0 gap-5">
            <label className="grid gap-2 type-label text-primary">
              {copy.selectSubject}
              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                disabled={controlsLocked}
                className="min-h-11 w-full rounded-md border border-border-strong bg-surface px-3.5 text-base font-normal text-primary shadow-soft disabled:bg-surface-muted disabled:text-muted"
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
                <option value="custom">{copy.customSubject}</option>
              </select>
            </label>

            <fieldset disabled={controlsLocked}>
              <legend className="type-label mb-2 text-primary">{copy.duration}</legend>
              <div className="grid grid-cols-4 gap-2">
                {durationChoices.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => chooseDuration(minutes)}
                    aria-pressed={durationChoice === minutes}
                    className={cn(
                      "min-h-11 rounded-md border px-2 type-small transition-colors",
                      durationChoice === minutes
                        ? "border-accent bg-accent-soft text-primary"
                        : "border-border bg-surface text-secondary hover:border-border-strong",
                    )}
                  >
                    {minutes}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => chooseDuration("custom")}
                  aria-pressed={durationChoice === "custom"}
                  className={cn(
                    "min-h-11 rounded-md border px-2 type-small transition-colors",
                    durationChoice === "custom"
                      ? "border-accent bg-accent-soft text-primary"
                      : "border-border bg-surface text-secondary hover:border-border-strong",
                  )}
                >
                  {copy.customSubject}
                </button>
              </div>
            </fieldset>

            {durationChoice === "custom" ? (
              <Input
                type="number"
                min={5}
                max={180}
                step={1}
                label={copy.customDuration}
                value={customDuration}
                disabled={controlsLocked}
                error={customDurationValid ? undefined : copy.durationError}
                onChange={(event) => {
                  const value = event.target.value;
                  setCustomDuration(value);
                  const minutes = Number(value);
                  setRemainingSeconds(
                    Number.isInteger(minutes) && minutes >= 5 && minutes <= 180
                      ? minutes * 60
                      : 0,
                  );
                  setStatus("idle");
                }}
              />
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              {status === "running" ? (
                <Button onClick={pause}>{copy.pause}</Button>
              ) : status === "paused" ? (
                <Button onClick={resume}>{copy.resume}</Button>
              ) : (
                <Button onClick={start} disabled={!customDurationValid}>{copy.start}</Button>
              )}
              <Button variant="secondary" onClick={complete} disabled={status === "idle" || status === "completed"}>
                {copy.finish}
              </Button>
              <Button className="col-span-2" variant="ghost" onClick={reset}>
                {copy.reset}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

function subjectCategory(subjectId: string): StudyCategory {
  if (subjectId === "subject-psychology-312") return "psychology";
  if (subjectId === "subject-politics") return "politics";
  if (subjectId === "subject-english") return "vocabulary";
  return "other";
}
