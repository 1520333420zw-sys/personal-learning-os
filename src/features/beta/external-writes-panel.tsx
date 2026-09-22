"use client";

import { useState } from "react";
import { Button, Card, SectionHeader } from "@/components/ui";
import { applyExternalWrite, revertExternalWrite } from "@/data/browser/external-write-merge";
import { saveBetaState } from "@/data/browser/beta-store";
import type { ExternalWriteReceipt } from "@/domain/external-writes/command";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { BetaPage, fieldClass } from "./shared";

const copy = {
  "zh-CN": {
    title: "ChatGPT 外部写入", description: "外部请求先进入安全收件箱。检查后导入当前浏览器；已有本地数据不会被替换。",
    token: "浏览器同步密钥（与 ChatGPT 写入密钥不同）", connect: "读取收件箱", refresh: "刷新",
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
    title: "ChatGPT external writes", description: "External writes enter a secure inbox first. Review and import them into this browser without replacing existing local data.",
    token: "Browser sync secret (different from the ChatGPT write secret)", connect: "Read inbox", refresh: "Refresh",
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

  async function request(path: string, method = "GET", action?: string) {
    return fetch(path, { method, cache: "no-store", headers: { Authorization: `Bearer ${secret}`, ...(action ? { "Content-Type": "application/json" } : {}) },
      body: action ? JSON.stringify({ action }) : undefined });
  }
  async function refresh() {
    setBusy(true); setMessage("");
    try {
      const collected: ExternalWriteReceipt[] = [];
      let cursor: number | null = 0;
      while (cursor !== null) {
        const response = await request(`/api/external-writes?after=${cursor}`);
        if (!response.ok) { setMessage(response.status === 401 ? l.auth : response.status === 503 ? l.setup : l.failed); return; }
        const page = await response.json() as { items: ExternalWriteReceipt[]; nextCursor: number | null };
        collected.push(...page.items);
        cursor = page.nextCursor;
      }
      setItems(collected);
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
    </label><Button onClick={() => void refresh()} disabled={busy || !secret}>{items.length ? l.refresh : l.connect}</Button></div>
    {message ? <p className="type-small mt-3 text-secondary" role="status">{message}</p> : null}
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
      <div className="mt-3 grid gap-2">{state.externalWriteReceipts.filter((entry) => !entry.revertedAt).slice(0, 10).map((entry) => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2"><span className="type-small text-secondary">{entry.type} · {entry.importedAt.slice(0, 10)}</span><Button size="sm" variant="ghost" onClick={() => void undoItem(entry.id)} disabled={busy || !secret}>{l.undo}</Button></div>)}</div>
    </div> : null}
  </Card></section>;
}
