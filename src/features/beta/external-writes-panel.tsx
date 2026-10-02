"use client";

import { useEffect, useState } from "react";
import { Button, Card, SectionHeader } from "@/components/ui";
import { applyExternalWrite, revertExternalWrite } from "@/data/browser/external-write-merge";
import { saveBetaState } from "@/data/browser/beta-store";
import { listExternalWrites } from "@/data/browser/external-write-sync";
import { LEARNING_MIRROR_STATUS_EVENT, syncLearningMirror, type LearningMirrorSyncResult } from "@/data/browser/learning-mirror-sync";
import type { ExternalWriteReceipt } from "@/domain/external-writes/command";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { BetaPage, fieldClass } from "./shared";
import { EXTERNAL_SYNC_CONNECTED_EVENT } from "./external-write-auto-sync";

const copy = {
  "zh-CN": {
    title: "ChatGPT 外部写入", description: "外部请求先进入安全收件箱。启用此浏览器后会自动安全导入；已有本地数据不会被替换。",
    token: "浏览器同步密钥（与 ChatGPT 写入密钥不同）", connect: "启用自动同步", refresh: "刷新", disconnect: "停用自动同步",
    automatic: "密钥仅用于建立此浏览器的安全 HttpOnly 会话，不会保存到网页代码或本地数据。此后打开应用会自动检查并导入。",
    connected: "已启用自动同步。",
    mirrorTitle: "学习数据只读镜像", mirrorDescription: "将当前浏览器已有的学习记录与任务安全同步到 D1 查询镜像，供 GPT 只读分析。浏览器 BetaState 仍是主数据源。",
    mirrorNow: "立即同步学习数据", mirrorLocal: "当前浏览器：{sessions} 条已完成学习记录，{tasks} 个任务。",
    mirrorSyncing: "正在同步学习数据…", mirrorSynced: "同步成功：更新 {sessions} 条学习记录、{tasks} 个任务、{deletions} 个删除标记。",
    mirrorUnchanged: "同步成功：D1 镜像已经是最新状态。", mirrorUnauthorized: "尚未建立浏览器同步会话。请在上方输入浏览器同步密钥并启用自动同步。",
    mirrorFailed: "学习数据镜像同步失败。请确认 D1 migration 已执行，然后重试。",
    noItems: "暂无待导入操作。", import: "导入", reject: "拒绝", undo: "撤销本地导入", acknowledge: "重试同步状态",
    revoke: "此操作已被外部撤销。若已导入，请在下方撤销本地记录。", history: "最近导入",
    auth: "同步密钥无效。", setup: "Cloudflare D1 或外部写入密钥尚未配置。", failed: "收件箱暂时无法访问。",
    invalid: "无法导入：引用的科目、章节或题目在当前浏览器中不存在，或本地存储失败。",
    saved: "已保存到当前浏览器。", undone: "已从当前浏览器撤销。", rejected: "已拒绝。",
    statusFailed: "本地已保存，但服务器状态未同步。请重试同步状态；重复导入不会创建第二条记录。",
    undoBlocked: "这次导入已有后续学习记录或阅读笔记，请先处理关联记录，再撤销。",
    confirmUndo: "确定撤销这次外部导入创建的记录吗？若之后编辑过这些记录，编辑也会被删除。",
  },
  en: {
    title: "ChatGPT external writes", description: "External writes enter a secure inbox first. Once enabled, this browser imports them automatically without replacing existing local data.",
    token: "Browser sync secret (different from the ChatGPT write secret)", connect: "Enable automatic sync", refresh: "Refresh", disconnect: "Disable automatic sync",
    automatic: "The secret only establishes a secure HttpOnly session for this browser. It is not saved in page code or local data. The app will then check and import automatically when opened.",
    connected: "Automatic sync is enabled.",
    mirrorTitle: "Read-only learning data mirror", mirrorDescription: "Securely mirror this browser's existing study records and tasks to D1 for read-only GPT analysis. Browser BetaState remains the source of truth.",
    mirrorNow: "Sync learning data now", mirrorLocal: "This browser: {sessions} completed study sessions and {tasks} tasks.",
    mirrorSyncing: "Syncing learning data…", mirrorSynced: "Sync complete: updated {sessions} sessions, {tasks} tasks and {deletions} deletion markers.",
    mirrorUnchanged: "Sync complete: the D1 mirror is already up to date.", mirrorUnauthorized: "No browser sync session. Enter the browser sync secret above and enable automatic sync.",
    mirrorFailed: "Learning data mirror sync failed. Confirm the D1 migration was applied, then retry.",
    noItems: "No pending writes.", import: "Import", reject: "Reject", undo: "Undo local import", acknowledge: "Retry status sync",
    revoke: "This write was revoked externally. If imported, undo its local record below.", history: "Recent imports",
    auth: "Invalid sync secret.", setup: "Cloudflare D1 or external write secrets are not configured.", failed: "Inbox is unavailable.",
    invalid: "Import failed: the referenced subject, chapter or question is missing in this browser, or local storage failed.",
    saved: "Saved in this browser.", undone: "Removed from this browser.", rejected: "Rejected.",
    statusFailed: "Saved locally, but server status did not sync. Retry status sync; importing again will not create a duplicate.",
    undoBlocked: "This import now has linked study sessions or reading notes. Resolve those records before undoing it.",
    confirmUndo: "Undo records created by this external import? Any later edits to those records will also be removed.",
  },
} as const;

export function ExternalWritesPage({ locale }: { locale: Locale }) {
  const l = copy[locale];
  return <BetaPage title={l.title} description={l.description}><ExternalWritesPanel locale={locale} showHeading={false} /></BetaPage>;
}

export function ExternalWritesPanel({ locale, showHeading = true }: { locale: Locale; showHeading?: boolean }) {
  const l = copy[locale];
  const { state, importJson } = useBetaData();
  const [secret, setSecret] = useState("");
  const [items, setItems] = useState<ExternalWriteReceipt[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(false);
  const [mirrorBusy, setMirrorBusy] = useState(false);
  const [mirrorResult, setMirrorResult] = useState<LearningMirrorSyncResult | null>(null);

  useEffect(() => {
    const receive = (event: Event) => setMirrorResult((event as CustomEvent<LearningMirrorSyncResult>).detail);
    window.addEventListener(LEARNING_MIRROR_STATUS_EVENT, receive);
    return () => window.removeEventListener(LEARNING_MIRROR_STATUS_EVENT, receive);
  }, []);

  async function syncMirror() {
    setMirrorBusy(true);
    setMirrorResult({ status: "syncing", sessions: 0, tasks: 0, deletions: 0 });
    try { setMirrorResult(await syncLearningMirror(state)); }
    catch { setMirrorResult({ status: "failed", sessions: 0, tasks: 0, deletions: 0 }); }
    finally { setMirrorBusy(false); }
  }

  function mirrorMessage(result: LearningMirrorSyncResult | null) {
    if (!result) return "";
    if (result.status === "syncing") return l.mirrorSyncing;
    if (result.status === "unchanged") return l.mirrorUnchanged;
    if (result.status === "unauthorized") return l.mirrorUnauthorized;
    if (result.status === "failed") return l.mirrorFailed;
    return l.mirrorSynced.replace("{sessions}", String(result.sessions)).replace("{tasks}", String(result.tasks)).replace("{deletions}", String(result.deletions));
  }

  async function request(path: string, method = "GET", action?: string) {
    return fetch(path, { method, cache: "no-store", credentials: "same-origin", headers: { ...(secret ? { Authorization: `Bearer ${secret}` } : {}), ...(action ? { "Content-Type": "application/json" } : {}) },
      body: action ? JSON.stringify({ action }) : undefined });
  }
  async function refresh() {
    setBusy(true); setMessage("");
    try {
      const inbox = await listExternalWrites();
      if (!inbox.response.ok) { setConnected(false); setMessage(inbox.response.status === 401 ? l.auth : inbox.response.status === 503 ? l.setup : l.failed); return; }
      setConnected(true);
      setItems(inbox.items);
    } catch { setMessage(l.failed); }
    finally { setBusy(false); }
  }
  async function connect() {
    if (!secret) { await refresh(); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/external-writes/session", {
        method: "POST", cache: "no-store", credentials: "same-origin", headers: { Authorization: `Bearer ${secret}` },
      });
      if (!response.ok) { setMessage(response.status === 401 ? l.auth : response.status === 503 ? l.setup : l.failed); return; }
      setSecret(""); setConnected(true); setMessage(l.connected);
      window.dispatchEvent(new Event(EXTERNAL_SYNC_CONNECTED_EVENT));
    } catch { setMessage(l.failed); }
    finally { setBusy(false); }
  }
  async function disconnect() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/external-writes/session", { method: "DELETE", cache: "no-store", credentials: "same-origin" });
      if (!response.ok) { setMessage(l.failed); return; }
      setConnected(false); setItems([]);
    } catch { setMessage(l.failed); }
    finally { setBusy(false); }
  }
  function persist(next: typeof state) {
    saveBetaState(next);
    const result = importJson(JSON.stringify(next));
    if (!result.ok) throw new Error("LOCAL_IMPORT_FAILED");
  }
  async function updateStatus(id: string, action: string) {
    const response = await request(`/api/external-writes/${id}`, "PATCH", action);
    return response.ok;
  }
  async function importItem(item: ExternalWriteReceipt) {
    setBusy(true); setMessage("");
    try {
      const prior = state.externalWriteReceipts.find((entry) => entry.id === item.id);
      if (prior?.revertedAt) {
        if (!await updateStatus(item.id, "reject")) { setMessage(l.failed); return; }
        setItems((previous) => previous.filter((entry) => entry.id !== item.id)); setMessage(l.rejected); return;
      }
      if (!prior) {
        const next = structuredClone(state);
        applyExternalWrite(next, item);
        persist(next);
      }
      if (!await updateStatus(item.id, "applied")) { setMessage(l.statusFailed); return; }
      setItems((previous) => previous.filter((entry) => entry.id !== item.id));
      setMessage(l.saved);
    } catch { setMessage(l.invalid); }
    finally { setBusy(false); }
  }
  async function rejectItem(id: string) {
    setBusy(true);
    try {
      if (!await updateStatus(id, "reject")) { setMessage(l.failed); return; }
      setItems((previous) => previous.filter((entry) => entry.id !== id)); setMessage(l.rejected);
    } catch { setMessage(l.failed); }
    finally { setBusy(false); }
  }
  async function undoItem(id: string) {
    const alreadyReverted = state.externalWriteReceipts.find((entry) => entry.id === id)?.revertedAt;
    if (!alreadyReverted && !window.confirm(l.confirmUndo)) return;
    setBusy(true);
    try {
      if (!alreadyReverted) {
        const next = structuredClone(state);
        if (!revertExternalWrite(next, id)) return;
        persist(next);
      }
      if (!await updateStatus(id, "undo") && !await updateStatus(id, "reverted") && !await updateStatus(id, "reject")) {
        setMessage(l.statusFailed); return;
      }
      setItems((previous) => previous.filter((entry) => entry.id !== id)); setMessage(l.undone);
    } catch (error) { setMessage(error instanceof Error && error.message === "IMPORTED_ITEM_HAS_DEPENDENCIES" ? l.undoBlocked : l.failed); }
    finally { setBusy(false); }
  }

  return <section aria-label={l.title}>{showHeading ? <SectionHeader title={l.title} description={l.description}/> : null}<Card className={showHeading ? "mt-5" : undefined} padding="sm">
    <div className="flex flex-col gap-3 tablet:flex-row tablet:items-end"><label className="type-label grid min-w-0 flex-1 gap-2 text-primary">{l.token}
      <input type="password" autoComplete="off" className={fieldClass} value={secret} onChange={(event) => setSecret(event.target.value)} />
      <span className="type-caption font-normal text-muted">{l.automatic}</span>
    </label><Button onClick={() => void (secret ? connect() : refresh())} disabled={busy}>{secret ? l.connect : l.refresh}</Button>
    {connected ? <Button variant="ghost" onClick={() => void disconnect()} disabled={busy}>{l.disconnect}</Button> : null}</div>
    {message ? <p className="type-small mt-3 text-secondary" role="status">{message}</p> : null}
    <div className="mt-5 border-t border-border pt-5">
      <h3 className="type-h3 text-primary">{l.mirrorTitle}</h3>
      <p className="type-small mt-2 text-secondary">{l.mirrorDescription}</p>
      <p className="type-small mt-2 text-muted">{l.mirrorLocal.replace("{sessions}", String(state.studySessions.filter((item) => item.completed).length)).replace("{tasks}", String(state.tasks.length))}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3"><Button size="sm" variant="secondary" onClick={() => void syncMirror()} disabled={mirrorBusy}>{l.mirrorNow}</Button>
        {mirrorResult ? <span className="type-small text-secondary" role="status">{mirrorMessage(mirrorResult)}</span> : null}
      </div>
    </div>
    <div className="mt-5 grid gap-3">{items.length ? items.map((item) => <div key={item.id} className="rounded-md border border-border p-4">
      <p className="type-label text-primary">{item.command.type} · {item.createdAt.slice(0, 16).replace("T", " ")}</p>
      <p className="type-small mt-2 break-words whitespace-pre-wrap text-secondary">{JSON.stringify(item.command, null, 2)}</p>
      {item.status === "revoke_requested" ? <p className="type-small mt-2 text-secondary">{l.revoke}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">{item.status === "pending" ? <>
        <Button size="sm" onClick={() => void importItem(item)} disabled={busy}>{state.externalWriteReceipts.some((entry) => entry.id === item.id && entry.revertedAt) ? l.reject : state.externalWriteReceipts.some((entry) => entry.id === item.id) ? l.acknowledge : l.import}</Button>
        {!state.externalWriteReceipts.some((entry) => entry.id === item.id && !entry.revertedAt) ? <Button size="sm" variant="secondary" onClick={() => void rejectItem(item.id)} disabled={busy}>{l.reject}</Button> : null}
      </> : state.externalWriteReceipts.some((entry) => entry.id === item.id) ?
        <Button size="sm" variant="secondary" onClick={() => void undoItem(item.id)} disabled={busy}>{l.undo}</Button> : null}</div>
    </div>) : <p className="type-small text-secondary">{l.noItems}</p>}</div>
    {state.externalWriteReceipts.some((entry) => !entry.revertedAt) ? <div className="mt-6 border-t border-border pt-4"><h3 className="type-h3 text-primary">{l.history}</h3>
      <div className="mt-3 grid gap-2">{state.externalWriteReceipts.filter((entry) => !entry.revertedAt).slice(0, 10).map((entry) => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2"><span className="type-small text-secondary">{entry.type} · {entry.importedAt.slice(0, 10)}</span><Button size="sm" variant="ghost" onClick={() => void undoItem(entry.id)} disabled={busy || !connected}>{l.undo}</Button></div>)}</div>
    </div> : null}
  </Card></section>;
}
