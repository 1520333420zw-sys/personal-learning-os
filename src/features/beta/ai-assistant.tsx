"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Card } from "@/components/ui";
import { parseLearningAction, type LearningAction } from "@/domain/ai/actions";
import type { BetaState } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { areaClass, localDate, nowEntity, uid } from "./shared";

const labels = {
  "zh-CN": { title: "AI 操作助手", placeholder: "例如：今天学了30分钟普通心理学", parse: "理解指令", unavailable: "尚未配置 AI 服务。请在 Cloudflare 配置服务端 AI provider；这里不会生成模拟回复。", disclosure: "解析时会将输入内容及科目目录发送给你配置的 AI 服务。涉及个人健康或财务信息时请先确认该服务适合处理。", error: "AI 返回了无法用于记录的内容，本次没有写入数据。", preview: "将执行以下操作", confirm: "确认记录", cancel: "取消", done: "已保存到本地数据。", close: "关闭", subjectError: "AI 返回的科目、章节或记录未能匹配本地数据，本次没有写入。", local: "确认后才写入本浏览器数据。" },
  en: { title: "AI Action Assistant", placeholder: "For example: I studied general psychology for 30 minutes today", parse: "Interpret", unavailable: "AI service is not configured. Configure a server-side AI provider in Cloudflare; no simulated reply will be shown.", disclosure: "Parsing sends your text and subject outline to the configured AI provider. Consider its handling of health or financial details before submitting.", error: "AI returned content that cannot be recorded. Nothing was saved.", preview: "The following action will run", confirm: "Confirm and save", cancel: "Cancel", done: "Saved to local data.", close: "Close", subjectError: "AI returned an unknown subject, chapter or record. Nothing was saved.", local: "Nothing is saved until you confirm." },
};

function referencesExist(action: LearningAction, state: BetaState) {
  if ("subjectId" in action && action.subjectId && !state.subjects.some((subject) => subject.id === action.subjectId)) return false;
  if ("chapterId" in action && action.chapterId && !state.chapters.some((chapter) => chapter.id === action.chapterId)) return false;
  if ("chapterId" in action && action.chapterId && "subjectId" in action && action.subjectId &&
    !state.chapters.some((chapter) => chapter.id === action.chapterId && chapter.subjectId === action.subjectId)) return false;
  if (action.type === "updateBookProgress" && !state.books.some((book) => book.id === action.bookId)) return false;
  if (action.type === "scheduleReview" && ![...state.knowledgePoints, ...state.vocabulary, ...state.recitations, ...state.questions].some((item) => item.id === action.targetId)) return false;
  if (action.type === "createMemorizationItem" && action.knowledgePointId && !state.knowledgePoints.some((item) => item.id === action.knowledgePointId)) return false;
  return true;
}

function describeAction(action: LearningAction, state: BetaState, locale: Locale): string[] {
  const subjectId = "subjectId" in action ? action.subjectId : undefined;
  const chapterId = "chapterId" in action ? action.chapterId : undefined;
  const subject = state.subjects.find((item) => item.id === subjectId);
  const chapter = state.chapters.find((item) => item.id === chapterId);
  const subjectName = subject ? locale === "en" ? subject.nameEn : subject.name : "";
  const chapterName = chapter ? locale === "en" ? chapter.titleEn : chapter.title : "";
  const label = locale === "en" ? {
    createTask: "Create task", createStudySession: "Record study", recordCountedStudy: "Record study count", createMemorizationItem: "Add recitation",
    createNote: "Create note", createExpense: "Record expense", createIncome: "Record income", createSleepRecord: "Record sleep",
    createExerciseRecord: "Record exercise", updateBookProgress: "Update book progress", addVocabulary: "Add word", scheduleReview: "Schedule review",
  } : {
    createTask: "创建任务", createStudySession: "记录学习", recordCountedStudy: "记录学习数量", createMemorizationItem: "加入背诵",
    createNote: "创建笔记", createExpense: "记录支出", createIncome: "记录收入", createSleepRecord: "记录睡眠",
    createExerciseRecord: "记录运动", updateBookProgress: "更新阅读进度", addVocabulary: "添加单词", scheduleReview: "安排复习",
  };
  const detail = action.type === "createTask" ? `${action.title} · ${action.minutes} min · ${action.date}` :
    action.type === "createStudySession" ? `${action.sessionType === "reading" ? (locale === "en" ? "Reading · " : "阅读 · ") : ""}${action.minutes} min · ${action.date}` :
    action.type === "recordCountedStudy" ? `${action.count} ${action.activity === "vocabulary_recitation" ? (locale === "en" ? "words recited" : "个单词已背诵") : (locale === "en" ? "incorrect questions reported" : "道错题已报告")} · ${action.date}` :
    action.type === "createMemorizationItem" ? action.title : action.type === "createNote" ? action.title :
    action.type === "createExpense" || action.type === "createIncome" ? `${action.amount} · ${action.category} · ${action.date}` :
    action.type === "createSleepRecord" ? `${action.hours} h · ${action.date}` :
    action.type === "createExerciseRecord" ? `${action.activity} · ${action.minutes} min · ${action.date}` :
    action.type === "updateBookProgress" ? `${state.books.find((item) => item.id === action.bookId)?.title ?? ""} · ${action.progress}%` :
    action.type === "addVocabulary" ? `${action.word} · ${action.meaning}` :
    action.type === "scheduleReview" ? `${action.title} · ${action.date}` : "";
  return [label[action.type], subjectName, chapterName, detail].filter(Boolean);
}

function executeAction(draft: BetaState, action: LearningAction) {
  const now = new Date(); const entity = (prefix: string) => nowEntity(uid(prefix), draft.ownerId);
  switch (action.type) {
    case "createTask": draft.tasks.push({ ...entity("task"), title: action.title, description: "", subjectId: action.subjectId,
      chapterId: action.chapterId, date: action.date, plannedMinutes: action.minutes, actualMinutes: 0, priority: "medium", status: "todo", sourceType: "manual" }); break;
    case "createStudySession": {
      const end = action.date === localDate(now) ? now : new Date(`${action.date}T12:00:00`);
      draft.studySessions.unshift({ ...entity("session"), subjectId: action.subjectId, chapterId: action.chapterId, startedAt: new Date(end.getTime() - action.minutes * 60000).toISOString(),
        endedAt: end.toISOString(), durationMinutes: action.minutes, sessionType: action.sessionType ?? "learning", completed: true }); break;
    }
    case "recordCountedStudy": {
      const end = action.date === localDate(now) ? now : new Date(`${action.date}T12:00:00`);
      draft.studySessions.unshift({ ...entity("session"), subjectId: action.subjectId, chapterId: action.chapterId,
        startedAt: end.toISOString(), endedAt: end.toISOString(), durationMinutes: 0,
        sessionType: action.activity === "vocabulary_recitation" ? "recitation" : "practice", completed: true,
        itemCount: action.count, incorrectCount: action.activity === "question_mistakes" ? action.count : undefined }); break;
    }
    case "createMemorizationItem": {
      const point = draft.knowledgePoints.find((item) => item.id === action.knowledgePointId);
      if (point && draft.recitations.some((item) => item.knowledgePointId === point.id)) break;
      draft.recitations.push({ ...entity("recitation"), title: point?.title ?? action.title, content: point ? [point.coreConcept, point.keyPoints].filter(Boolean).join("\n") : action.content ?? "",
      category: "AI", subjectId: point?.subjectId ?? action.subjectId, chapterId: point?.chapterId ?? action.chapterId, knowledgePointId: point?.id, status: "today", favorite: false,
      nextReviewAt: localDate(now), type: "custom", reviewCount: 0, mastery: "new" }); break;
    }
    case "createNote": draft.notes.push({ ...entity("note"), title: action.title, content: action.content,
      tags: [], subjectId: action.subjectId, favorite: false }); break;
    case "createExpense": case "createIncome": draft.finance.push({ ...entity("finance"), date: action.date,
      type: action.type === "createExpense" ? "expense" : "income", amount: action.amount, category: action.category, note: action.note }); break;
    case "createSleepRecord": draft.sleep.push({ ...entity("sleep"), date: action.date, hours: action.hours, quality: 3 }); break;
    case "createExerciseRecord": draft.exercises.push({ ...entity("exercise"), date: action.date, activity: action.activity, minutes: action.minutes, notes: "" }); break;
    case "updateBookProgress": { const book = draft.books.find((item) => item.id === action.bookId); if (book) { book.progress = action.progress; book.updatedAt = now.toISOString(); } break; }
    case "addVocabulary": draft.vocabulary.push({ ...entity("word"), word: action.word, meaning: action.meaning,
      phonetic: "", example: "", examType: "general", familiarity: "new", favorite: false, reviewCount: 0, nextReviewAt: localDate(now) }); break;
    case "scheduleReview": {
      const kind = draft.vocabulary.some((item) => item.id === action.targetId) ? "vocabulary" : draft.recitations.some((item) => item.id === action.targetId) ? "recitation" : draft.questions.some((item) => item.id === action.targetId) ? "question" : "knowledge";
      draft.reviewItems.push({ ...entity("review"), kind, targetId: action.targetId, title: action.title, dueDate: action.date, status: "due" }); break;
    }
  }
}

export function AiAssistant({ locale }: { locale: Locale }) {
  const l = labels[locale]; const { state, mutate } = useBetaData();
  const [open, setOpen] = useState(false); const [configured, setConfigured] = useState(false);
  const [prompt, setPrompt] = useState(""); const [action, setAction] = useState<LearningAction | null>(null);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/ai-action").then((response) => response.json()).then((data: { configured?: boolean }) => setConfigured(Boolean(data.configured))).catch(() => setConfigured(false)); }, []);
  async function parse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!configured || prompt.trim().length < 3) return; setBusy(true); setMessage(""); setAction(null);
    try { const response = await fetch("/api/ai-action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, today: localDate(), subjects: state.subjects.map(({ id, name, nameEn }) => ({ id, name, nameEn })), chapters: state.chapters.map(({ id, title, titleEn, subjectId }) => ({ id, title, titleEn, subjectId })), knowledgePoints: state.knowledgePoints.map(({ id, title, titleEn, chapterId }) => ({ id, title, titleEn, chapterId })) }) });
      const data: { action?: unknown; code?: string; upstreamStatus?: number; parameter?: string } = await response.json();
      if (!response.ok) {
        const reason = data.code === "provider_http" ? `${locale === "en" ? "AI provider rejected the request" : "AI 服务拒绝了请求"} (HTTP ${data.upstreamStatus ?? "?"}${data.parameter ? ` · ${data.parameter}` : ""}).` :
          data.code === "provider_transport" ? (locale === "en" ? "Could not reach the AI provider or it timed out." : "无法连接 AI 服务，或请求超时。") :
          data.code === "provider_model_json" || data.code === "provider_response_json" || data.code === "provider_response_shape" ? (locale === "en" ? "AI response format was invalid. Nothing was saved." : "AI 响应格式无效，本次没有写入数据。") :
          data.code === "schema_validation_failed" ? (locale === "en" ? "AI action failed field validation. Nothing was saved." : "AI 操作字段未通过校验，本次没有写入数据。") :
          data.code === "unsupported_action" ? (locale === "en" ? "AI could not represent this as one supported action. Nothing was saved." : "AI 未能将这条记录转换为已支持的单项操作，本次没有写入数据。") : l.error;
        setMessage(reason); return;
      }
      const parsed = parseLearningAction(data.action);
      if (!parsed) setMessage(l.error); else if (!referencesExist(parsed, state)) setMessage(l.subjectError); else setAction(parsed);
    } catch { setMessage(locale === "en" ? "The AI request failed or returned an unreadable response. Nothing was saved." : "AI 请求失败或响应无法读取，本次没有写入数据。"); } finally { setBusy(false); }
  }
  function confirm() { if (!action || !referencesExist(action, state)) { setMessage(l.subjectError); return; } mutate((draft) => executeAction(draft, action)); setAction(null); setPrompt(""); setMessage(l.done); }
  return <><button type="button" onClick={() => setOpen(true)} className="fixed bottom-24 right-4 z-40 min-h-12 rounded-full border border-border-strong bg-surface-raised px-4 text-sm font-medium text-primary shadow-card hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent desktop:bottom-5" aria-label={l.title}><span aria-hidden="true">✦</span><span className="sr-only desktop:not-sr-only"> {l.title}</span></button>
    {open ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-0 tablet:items-center tablet:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section role="dialog" aria-modal="true" aria-label={l.title} className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-t-xl bg-surface-raised p-5 shadow-card tablet:rounded-xl tablet:p-7"><div className="flex items-center justify-between gap-3"><h2 className="type-h2 text-primary">{l.title}</h2><Button size="sm" variant="ghost" onClick={() => setOpen(false)}>{l.close}</Button></div>
      {!configured ? <Card variant="muted" className="mt-5"><p className="type-body text-secondary">{l.unavailable}</p></Card> : <form onSubmit={(event) => void parse(event)} className="mt-5 grid gap-3"><label className="type-label text-primary">{l.title}<textarea className={`${areaClass} mt-2`} value={prompt} placeholder={l.placeholder} onChange={(event) => setPrompt(event.target.value)} maxLength={1000} /></label><p className="type-caption text-muted">{l.disclosure}</p><Button type="submit" disabled={busy || prompt.trim().length < 3}>{l.parse}</Button></form>}
      {message ? <p className="type-small mt-4 text-secondary" role="status">{message}</p> : null}
      {action ? <Card className="mt-5" padding="sm"><h3 className="type-h3 text-primary">{l.preview}</h3><div className="mt-3 grid gap-1">{describeAction(action, state, locale).map((line) => <p key={line} className="type-small text-secondary">{line}</p>)}</div><p className="type-caption mt-3 text-muted">{l.local}</p><div className="mt-4 flex gap-2"><Button onClick={confirm}>{l.confirm}</Button><Button variant="secondary" onClick={() => setAction(null)}>{l.cancel}</Button></div></Card> : null}
    </section></div> : null}</>;
}
