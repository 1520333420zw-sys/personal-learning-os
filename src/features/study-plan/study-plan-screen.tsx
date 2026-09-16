"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge, Button, Card, Input, Textarea } from "@/components/ui";
import type { TaskStatus } from "@/domain";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { addLocalDays, fromLocalDateKey, toLocalDateKey } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useLearningData } from "@/providers";

import { StudyPlanService } from "./study-plan-service";
import type {
  StudyPlanDayData,
  StudyPlanFilter,
  StudyPlanTaskViewModel,
  StudyTaskDraft,
} from "./types";

const durationPresets = [15, 25, 30, 45, 60, 90] as const;
const priorityVariants = { low: "neutral", medium: "accent", high: "warm" } as const;
const statusVariants = { todo: "neutral", in_progress: "accent", completed: "success", cancelled: "error" } as const;

interface StudyPlanScreenProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function StudyPlanScreen({ dictionary, locale }: StudyPlanScreenProps) {
  const messages = dictionary.studyPlan;
  const { context, notifyDataChanged } = useLearningData();
  const service = useMemo(
    () => new StudyPlanService(context, dictionary),
    [context, dictionary],
  );
  const [date, setDate] = useState(() => toLocalDateKey(new Date()));
  const [data, setData] = useState<StudyPlanDayData | null>(null);
  const [statusFilter, setStatusFilter] = useState<StudyPlanFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [editingTask, setEditingTask] = useState<StudyPlanTaskViewModel | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<StudyPlanTaskViewModel | null>(null);

  const loadDay = useCallback(async () => {
    setData(await service.getDay(date));
  }, [date, service]);

  useEffect(() => {
    let active = true;
    void service.getDay(date).then((nextData) => {
      if (active) setData(nextData);
    });
    return () => {
      active = false;
    };
  }, [date, service]);

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks.filter(
      (task) =>
        (statusFilter === "all" || task.status === statusFilter) &&
        (subjectFilter === "all" || task.subjectId === subjectFilter),
    );
  }, [data, statusFilter, subjectFilter]);

  const mutate = useCallback(
    async (operation: () => Promise<unknown>) => {
      await operation();
      notifyDataChanged();
      await loadDay();
    },
    [loadDay, notifyDataChanged],
  );

  const openCreate = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const dateLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(fromLocalDateKey(date));
  const isToday = date === toLocalDateKey(new Date());

  return (
    <main className="page-container overflow-hidden">
      <div className="flex flex-col gap-8 tablet:gap-10">
        <header className="flex flex-col gap-5 tablet:flex-row tablet:items-end tablet:justify-between">
          <div className="max-w-2xl">
            <h1 className="type-h1 text-primary">{messages.title}</h1>
            <p className="type-body mt-3 text-secondary">{messages.description}</p>
          </div>
          <Button className="self-start tablet:self-auto" onClick={openCreate}>
            <span aria-hidden="true">＋</span>{messages.addTask}
          </Button>
        </header>

        <section aria-label={messages.date} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 tablet:flex-row tablet:items-center tablet:justify-between">
          <div>
            <p className="type-caption text-muted">{isToday ? messages.today : messages.date}</p>
            <p className="type-h3 mt-1 text-primary">{dateLabel}</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button variant="secondary" size="sm" aria-label={messages.previousDay} onClick={() => setDate(addLocalDays(date, -1))}>← <span className="hidden tablet:inline">{messages.previousDay}</span></Button>
            <Button variant="ghost" size="sm" onClick={() => setDate(toLocalDateKey(new Date()))}>{messages.today}</Button>
            <Button variant="secondary" size="sm" aria-label={messages.nextDay} onClick={() => setDate(addLocalDays(date, 1))}><span className="hidden tablet:inline">{messages.nextDay}</span> →</Button>
            <Input className="w-[9.5rem]" label={messages.chooseDate} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
        </section>

        {data ? <TaskSummary data={data} dictionary={dictionary} /> : null}

        <section aria-labelledby="task-list-title">
          <div className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between">
            <h2 id="task-list-title" className="type-h2 text-primary">{dateLabel}</h2>
            <TaskFilters
              data={data}
              dictionary={dictionary}
              status={statusFilter}
              subject={subjectFilter}
              onStatusChange={setStatusFilter}
              onSubjectChange={setSubjectFilter}
            />
          </div>

          {!data ? (
            <Card className="mt-5"><p className="type-body text-secondary">{messages.loading}</p></Card>
          ) : filteredTasks.length ? (
            <div className="mt-5 space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  dictionary={dictionary}
                  onEdit={() => { setEditingTask(task); setTaskDialogOpen(true); }}
                  onDelete={() => setDeletingTask(task)}
                  onStatus={(status) => mutate(() => service.setStatus(task.id, status))}
                />
              ))}
            </div>
          ) : (
            <Card className="mt-5 text-center" variant="muted" padding="lg">
              <p className="type-body text-secondary">
                {data.tasks.length ? messages.empty.filtered : messages.empty.day}
              </p>
              {!data.tasks.length ? <Button className="mt-5" onClick={openCreate}>{messages.addTask}</Button> : null}
            </Card>
          )}
        </section>
      </div>

      {taskDialogOpen ? <TaskDialog
        task={editingTask}
        date={date}
        subjects={data?.subjects ?? []}
        dictionary={dictionary}
        onClose={() => setTaskDialogOpen(false)}
        onSave={async (draft) => {
          await mutate(() => editingTask ? service.updateTask(editingTask.id, draft) : service.createTask(draft));
          setTaskDialogOpen(false);
        }}
      /> : null}
      <DeleteDialog
        task={deletingTask}
        dictionary={dictionary}
        onClose={() => setDeletingTask(null)}
        onConfirm={async () => {
          if (!deletingTask) return;
          await mutate(() => service.deleteTask(deletingTask.id));
          setDeletingTask(null);
        }}
      />
    </main>
  );
}

function TaskSummary({ data, dictionary }: { data: StudyPlanDayData; dictionary: Dictionary }) {
  const labels = dictionary.studyPlan.summary;
  const items = [
    [labels.total, `${data.summary.total} ${labels.tasks}`],
    [labels.completed, String(data.summary.completed)],
    [labels.remaining, String(data.summary.remaining)],
    [labels.planned, `${data.summary.plannedMinutes} ${labels.minutes}`],
  ];
  return (
    <section aria-label={labels.total} className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface desktop:grid-cols-4">
      {items.map(([label, value], index) => (
        <div key={label} className={cn("min-w-0 p-4 tablet:p-5", index % 2 === 1 && "border-l border-border", index >= 2 && "border-t border-border desktop:border-t-0", index === 2 && "desktop:border-l")}>
          <p className="type-caption text-muted">{label}</p>
          <p className="mt-2 text-xl font-semibold text-primary">{value}</p>
        </div>
      ))}
    </section>
  );
}

function TaskFilters({ data, dictionary, status, subject, onStatusChange, onSubjectChange }: {
  data: StudyPlanDayData | null; dictionary: Dictionary; status: StudyPlanFilter; subject: string;
  onStatusChange: (value: StudyPlanFilter) => void; onSubjectChange: (value: string) => void;
}) {
  const messages = dictionary.studyPlan;
  return (
    <div className="flex max-w-full flex-wrap items-end gap-3" aria-label={messages.filters.label}>
      <div className="flex max-w-full gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
        {(["all", "todo", "in_progress", "completed"] as const).map((value) => (
          <button key={value} type="button" aria-pressed={status === value} onClick={() => onStatusChange(value)} className={cn("min-h-10 shrink-0 rounded-sm px-3 text-sm text-secondary transition-colors", status === value && "bg-surface-raised font-medium text-primary shadow-soft")}>{messages.filters[value]}</button>
        ))}
      </div>
      <label className="grid min-w-40 gap-1.5 text-sm font-medium text-primary">
        {messages.subject}
        <select value={subject} onChange={(event) => onSubjectChange(event.target.value)} className="min-h-11 rounded-md border border-border-strong bg-surface px-3 text-primary outline-none">
          <option value="all">{messages.filters.allSubjects}</option>
          {data?.subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
    </div>
  );
}

function TaskCard({ task, dictionary, onEdit, onDelete, onStatus }: {
  task: StudyPlanTaskViewModel; dictionary: Dictionary; onEdit: () => void; onDelete: () => void; onStatus: (status: TaskStatus) => void;
}) {
  const messages = dictionary.studyPlan;
  const completed = task.status === "completed";
  return (
    <Card padding="sm" variant={completed ? "muted" : "default"}>
      <div className="flex min-w-0 items-start gap-3">
        <button type="button" role="checkbox" aria-checked={completed} aria-label={`${messages.status.complete}: ${task.title}`} onClick={() => onStatus(completed ? "todo" : "completed")} className={cn("mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full text-lg", completed ? "bg-accent text-white" : "border border-border-strong bg-surface text-muted")}>
          {completed ? "✓" : "○"}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 desktop:flex-row desktop:items-start desktop:justify-between">
            <div className="min-w-0">
              <h3 className={cn("type-body break-words font-medium text-primary", completed && "text-secondary line-through")}>{task.title}</h3>
              {task.description ? <p className="type-small mt-1 break-words text-secondary">{task.description}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {task.subjectName ? <Badge>{task.subjectName}</Badge> : null}
                <Badge>{task.plannedMinutes} {messages.summary.minutes}</Badge>
                <Badge variant={priorityVariants[task.priority]}>{messages.priorities[task.priority]}</Badge>
                <Badge variant={statusVariants[task.status]}>{task.status === "cancelled" ? task.status : messages.status[task.status]}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.status === "todo" ? <Button size="sm" variant="secondary" onClick={() => onStatus("in_progress")}>{messages.status.start}</Button> : null}
              {task.status === "in_progress" ? <Button size="sm" variant="secondary" onClick={() => onStatus("completed")}>{messages.status.complete}</Button> : null}
              {completed ? <Button size="sm" variant="secondary" onClick={() => onStatus("todo")}>{messages.status.restore}</Button> : null}
              <Button size="sm" variant="ghost" onClick={onEdit}>{messages.editTask}</Button>
              <Button size="sm" variant="ghost" className="text-error" onClick={onDelete}>{messages.deleteTask}</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TaskDialog({ task, date, subjects, dictionary, onClose, onSave }: {
  task: StudyPlanTaskViewModel | null; date: string; subjects: StudyPlanDayData["subjects"]; dictionary: Dictionary;
  onClose: () => void; onSave: (draft: StudyTaskDraft) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messages = dictionary.studyPlan;
  const [draft, setDraft] = useState<StudyTaskDraft>(() => task ? { title: task.title, description: task.description, subjectId: task.subjectId, date: task.date, plannedMinutes: task.plannedMinutes, priority: task.priority } : { title: "", description: "", subjectId: "", date, plannedMinutes: 25, priority: "medium" });
  const [errors, setErrors] = useState<{ title?: string; duration?: string }>({});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    dialog?.querySelector<HTMLInputElement>("input")?.focus();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = {
      title: draft.title.trim() ? undefined : messages.validation.title,
      duration: Number.isInteger(draft.plannedMinutes) && draft.plannedMinutes >= 5 && draft.plannedMinutes <= 480 ? undefined : messages.validation.duration,
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.duration) return;
    await onSave(draft);
  };

  return (
    <dialog ref={dialogRef} aria-labelledby="task-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }} className="m-auto max-h-[calc(100dvh-2rem)] w-[min(42rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-border bg-surface-raised p-0 text-primary shadow-card backdrop:bg-primary/25">
      <form onSubmit={submit} className="p-5 tablet:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id="task-dialog-title" className="type-h2">{task ? messages.dialog.editTitle : messages.dialog.createTitle}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={dictionary.common.close}>×</Button>
        </div>
        <div className="mt-6 grid gap-5">
          <Input autoFocus label={`${messages.taskName} *`} value={draft.title} error={errors.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          <Textarea label={messages.taskDescription} rows={3} value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          <div className="grid gap-5 tablet:grid-cols-2">
            <label className="grid gap-2 type-label text-primary">{messages.subject}<select value={draft.subjectId ?? ""} onChange={(event) => setDraft({ ...draft, subjectId: event.target.value })} className="min-h-11 rounded-md border border-border-strong bg-surface px-3 text-base font-normal text-primary outline-none"><option value="">{messages.noSubject}</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <Input label={`${messages.date} *`} type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
          </div>
          <fieldset><legend className="type-label text-primary">{messages.plannedDuration}</legend><div className="mt-2 flex flex-wrap gap-2">{durationPresets.map((minutes) => <button key={minutes} type="button" aria-pressed={draft.plannedMinutes === minutes} onClick={() => setDraft({ ...draft, plannedMinutes: minutes })} className={cn("min-h-10 rounded-full border px-3 text-sm", draft.plannedMinutes === minutes ? "border-accent bg-accent text-white" : "border-border-strong bg-surface text-secondary")}>{minutes}</button>)}</div></fieldset>
          <Input label={messages.customDuration} type="number" min={5} max={480} step={1} value={draft.plannedMinutes} error={errors.duration} onChange={(event) => setDraft({ ...draft, plannedMinutes: Number(event.target.value) })} />
          <fieldset><legend className="type-label text-primary">{messages.priority}</legend><div className="mt-2 flex flex-wrap gap-2">{(["low", "medium", "high"] as const).map((priority) => <button key={priority} type="button" aria-pressed={draft.priority === priority} onClick={() => setDraft({ ...draft, priority })} className={cn("min-h-10 rounded-full border px-4 text-sm", draft.priority === priority ? priority === "high" ? "border-warm-oat bg-warm-oat-soft text-primary" : "border-accent bg-accent text-white" : "border-border-strong bg-surface text-secondary")}>{messages.priorities[priority]}</button>)}</div></fieldset>
        </div>
        <div className="mt-7 flex flex-col-reverse gap-2 tablet:flex-row tablet:justify-end"><Button variant="secondary" onClick={onClose}>{messages.cancel}</Button><Button type="submit">{messages.save}</Button></div>
      </form>
    </dialog>
  );
}

function DeleteDialog({ task, dictionary, onClose, onConfirm }: { task: StudyPlanTaskViewModel | null; dictionary: Dictionary; onClose: () => void; onConfirm: () => Promise<void> }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messages = dictionary.studyPlan;
  useEffect(() => { const dialog = dialogRef.current; if (task && dialog && !dialog.open) dialog.showModal(); else if (!task) dialog?.close(); }, [task]);
  return <dialog ref={dialogRef} aria-labelledby="delete-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }} className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-border bg-surface-raised p-0 text-primary shadow-card backdrop:bg-primary/25"><div className="p-6"><h2 id="delete-dialog-title" className="type-h3">{messages.confirmDelete}</h2><p className="type-body mt-3 text-secondary">{task?.title}</p><p className="type-small mt-2 text-muted">{messages.confirmDeleteDescription}</p><div className="mt-6 flex flex-col-reverse gap-2 tablet:flex-row tablet:justify-end"><Button variant="secondary" onClick={onClose}>{messages.cancel}</Button><Button variant="danger" onClick={() => void onConfirm()}>{messages.deleteTask}</Button></div></div></dialog>;
}
