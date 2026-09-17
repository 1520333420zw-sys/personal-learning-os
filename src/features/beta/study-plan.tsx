"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/components/ui";
import type { BetaTask, BetaTaskPriority, BetaTaskStatus } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { getBetaMessages } from "@/i18n/beta-messages";
import { useBetaData } from "@/providers";
import { addLocalDays } from "@/lib/date";
import { areaClass, BetaPage, EmptyState, Field, fieldClass, localDate, Modal, nowEntity, Tabs, uid } from "./shared";
import { PlanningPanel } from "./planning-panel";

type Filter = "today" | "week" | "overdue" | "completed" | "unfinished" | "all";

export function BetaStudyPlan({ locale }: { locale: Locale }) {
  const m = getBetaMessages(locale); const { state, mutate } = useBetaData(); const router = useRouter();
  const [filter, setFilter] = useState<Filter>("today"); const [subjectFilter, setSubjectFilter] = useState("all");
  const [editing, setEditing] = useState<BetaTask | "new" | null>(null); const today = localDate(); const weekEnd = addLocalDays(today, 6);
  const tasks = useMemo(() => state.tasks.filter((task) => {
    if (subjectFilter !== "all" && task.subjectId !== subjectFilter) return false;
    if (filter === "today") return task.date === today;
    if (filter === "week") return task.date >= today && task.date <= weekEnd;
    if (filter === "overdue") return task.date < today && task.status !== "completed";
    if (filter === "completed") return task.status === "completed";
    if (filter === "unfinished") return task.status !== "completed";
    return true;
  }).sort((a,b) => a.date.localeCompare(b.date) || priorityOrder(b.priority)-priorityOrder(a.priority)), [state.tasks, filter, subjectFilter, today, weekEnd]);
  const summary = { total: tasks.length, completed: tasks.filter((t) => t.status === "completed").length, planned: tasks.reduce((n,t) => n+t.plannedMinutes,0), actual: tasks.reduce((n,t) => n+t.actualMinutes,0) };
  const tabs = (["today","week","unfinished","overdue","completed","all"] as Filter[]).map((id) => ({ id, label: m.plan[id] }));

  function updateStatus(task: BetaTask, status: BetaTaskStatus) { mutate((draft) => { const item = draft.tasks.find((x) => x.id === task.id); if (item) { item.status = status; item.completedAt = status === "completed" ? new Date().toISOString() : undefined; item.updatedAt = new Date().toISOString(); } }); }
  function remove(task: BetaTask) { if (!window.confirm(m.confirmDelete)) return; mutate((draft) => { draft.tasks = draft.tasks.filter((x) => x.id !== task.id); }); }
  function startFocus(task: BetaTask) { const now = new Date(); mutate((draft) => { draft.pomodoroRuntime = { id: uid("pomodoro"), subjectId: task.subjectId, taskId: task.id, durationMinutes: 25, startedAt: now.toISOString(), targetEndAt: new Date(now.getTime()+25*60000).toISOString(), remainingSeconds: 1500, status: "running" }; const item = draft.tasks.find((x) => x.id === task.id); if (item && item.status === "todo") item.status = "in_progress"; }); router.push(`/${locale}/focus`); }

  return <BetaPage title={m.plan.title} description={m.plan.subtitle} action={<Button onClick={() => setEditing("new")}>{m.plan.add}</Button>}>
    <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">{[[m.plan.all,summary.total],[m.plan.completed,summary.completed],[m.plan.planned,`${summary.planned} ${m.minutes}`],[m.plan.actual,`${summary.actual} ${m.minutes}`]].map(([label,value]) => <Card key={String(label)} padding="sm"><p className="type-caption text-muted">{label}</p><p className="type-h3 mt-2 text-primary">{value}</p></Card>)}</div>
    <div className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between"><Tabs label={m.status} items={tabs} value={filter} onChange={(id) => setFilter(id as Filter)} /><Field label={m.subject} className="tablet:w-64"><select className={fieldClass} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}><option value="all">{m.plan.all}</option>{state.subjects.map((s) => <option key={s.id} value={s.id}>{locale === "en" ? s.nameEn : s.name}</option>)}</select></Field></div>
    <div className="grid gap-3">{tasks.length ? tasks.map((task) => { const subject = state.subjects.find((s) => s.id === task.subjectId); const chapter = state.chapters.find((c) => c.id === task.chapterId); return <Card key={task.id} padding="sm" variant={task.status === "completed" ? "muted" : "default"}><div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className={`type-h3 text-primary ${task.status === "completed" ? "line-through opacity-60" : ""}`}>{task.title}</h2><Badge variant={task.priority === "high" ? "warm" : task.priority === "medium" ? "accent" : "neutral"}>{m.plan[task.priority]}</Badge><Badge variant={task.status === "completed" ? "success" : "neutral"}>{task.status === "todo" ? m.plan.todo : task.status === "in_progress" ? m.plan.progress : m.plan.done}</Badge></div>{task.description ? <p className="type-small mt-2 text-secondary">{task.description}</p> : null}<p className="type-caption mt-3 text-muted">{task.date} · {subject ? (locale === "en" ? subject.nameEn : subject.name) : "—"}{chapter ? ` · ${locale === "en" ? chapter.titleEn : chapter.title}` : ""} · {m.plan.planned} {task.plannedMinutes} {m.minutes} · {m.plan.actual} {task.actualMinutes} {m.minutes}</p></div><div className="flex flex-wrap gap-2">{task.status !== "completed" ? <><Button size="sm" onClick={() => updateStatus(task, task.status === "todo" ? "in_progress" : "completed")}>{task.status === "todo" ? m.plan.progress : m.plan.done}</Button><Button size="sm" variant="secondary" onClick={() => startFocus(task)}>{m.plan.startFocus}</Button></> : <Button size="sm" variant="secondary" onClick={() => updateStatus(task,"todo")}>{m.plan.todo}</Button>}<Button size="sm" variant="ghost" onClick={() => setEditing(task)}>{m.edit}</Button><Button size="sm" variant="ghost" onClick={() => remove(task)}>{m.delete}</Button></div></div></Card>; }) : <EmptyState action={<Button onClick={() => setEditing("new")}>{m.plan.add}</Button>}>{m.empty}</EmptyState>}</div>
    <PlanningPanel locale={locale} />
    {editing ? <TaskDialog locale={locale} task={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} /> : null}
  </BetaPage>;
}

function TaskDialog({ locale, task, onClose }: { locale: Locale; task?: BetaTask; onClose: () => void }) {
  const m = getBetaMessages(locale); const { state, mutate } = useBetaData(); const [title,setTitle]=useState(task?.title??""); const [description,setDescription]=useState(task?.description??""); const [subjectId,setSubjectId]=useState(task?.subjectId??""); const [chapterId,setChapterId]=useState(task?.chapterId??""); const [date,setDate]=useState(task?.date??localDate()); const [minutes,setMinutes]=useState(String(task?.plannedMinutes??25)); const [priority,setPriority]=useState<BetaTaskPriority>(task?.priority??"medium"); const valid=title.trim()&&Number(minutes)>=5&&Number(minutes)<=480;
  function save() { if (!valid) return; mutate((draft) => { const values={ title:title.trim(),description:description.trim(),subjectId:subjectId||undefined,chapterId:chapterId||undefined,date,plannedMinutes:Number(minutes),priority,updatedAt:new Date().toISOString() }; if(task){ const item=draft.tasks.find((x)=>x.id===task.id); if(item) Object.assign(item,values); } else draft.tasks.push({ ...nowEntity(uid("task"),draft.ownerId),...values,actualMinutes:0,status:"todo",sourceType:"manual",planningControl:"manual" }); }); onClose(); }
  return <Modal title={task?m.edit:m.plan.add} closeLabel={m.cancel} onClose={onClose}><div className="grid gap-4"><Field label={m.plan.taskTitle}><input autoFocus className={fieldClass} value={title} onChange={(e)=>setTitle(e.target.value)} /></Field><Field label={m.description}><textarea className={areaClass} value={description} onChange={(e)=>setDescription(e.target.value)} /></Field><div className="grid gap-4 tablet:grid-cols-2"><Field label={m.subject}><select className={fieldClass} value={subjectId} onChange={(e)=>{setSubjectId(e.target.value);setChapterId("");}}><option value="">—</option>{state.subjects.map((s)=><option key={s.id} value={s.id}>{locale==="en"?s.nameEn:s.name}</option>)}</select></Field><Field label={m.chapter}><select className={fieldClass} value={chapterId} onChange={(e)=>setChapterId(e.target.value)}><option value="">—</option>{state.chapters.filter((c)=>c.subjectId===subjectId).map((c)=><option key={c.id} value={c.id}>{locale==="en"?c.titleEn:c.title}</option>)}</select></Field><Field label={m.date}><input type="date" className={fieldClass} value={date} onChange={(e)=>setDate(e.target.value)} /></Field><Field label={m.plan.planned}><input type="number" min="5" max="480" className={fieldClass} value={minutes} onChange={(e)=>setMinutes(e.target.value)} /></Field><Field label={m.plan.priority}><select className={fieldClass} value={priority} onChange={(e)=>setPriority(e.target.value as BetaTaskPriority)}>{(["low","medium","high"] as const).map((p)=><option key={p} value={p}>{m.plan[p]}</option>)}</select></Field></div><div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>{m.cancel}</Button><Button onClick={save} disabled={!valid}>{m.save}</Button></div></div></Modal>;
}
function priorityOrder(value: BetaTaskPriority) { return {low:1,medium:2,high:3}[value]; }
