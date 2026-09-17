"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Button, Card } from "@/components/ui";
import { browserPdfStorage } from "@/data/storage/pdf-storage";
import type { BetaPdfDocument } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { areaClass, Field, fieldClass, nowEntity, uid } from "./shared";

const labels = {
  "zh-CN": { files: "PDF 学习资料", add: "导入 PDF", local: "PDF 文件保存在当前浏览器的 IndexedDB；JSON 备份只包含元数据与笔记，请另行保存原始 PDF。", open: "阅读", external: "在浏览器中打开 PDF", close: "关闭阅读", page: "当前页", pages: "总页数（手动填写）", note: "本页笔记", save: "保存笔记", knowledge: "关联知识库", remove: "删除 PDF", missing: "本机未找到 PDF 文件，请重新导入原文件。", failed: "PDF 无法保存到此浏览器。请检查浏览器存储权限与空间。", invalid: "请选择小于 100 MB 的 PDF 文件。", noFiles: "还没有导入 PDF。" },
  en: { files: "PDF study material", add: "Import PDF", local: "PDF files stay in this browser's IndexedDB. JSON backup contains metadata and notes only; keep your original PDF separately.", open: "Read", external: "Open PDF in browser", close: "Close reader", page: "Current page", pages: "Total pages (enter manually)", note: "Page note", save: "Save note", knowledge: "Link to knowledge base", remove: "Delete PDF", missing: "The PDF is missing from this browser. Please import the original file again.", failed: "Could not save PDF in this browser. Check storage permissions and available space.", invalid: "Choose a PDF under 100 MB.", noFiles: "No PDFs imported yet." },
};

export function PdfLibrary({ locale, ownerType, ownerRecordId, subjectId, chapterId }: {
  locale: Locale; ownerType: BetaPdfDocument["ownerType"]; ownerRecordId: string; subjectId?: string; chapterId?: string;
}) {
  const l = labels[locale]; const { state, mutate } = useBetaData();
  const [error, setError] = useState(""); const [active, setActive] = useState<BetaPdfDocument | null>(null);
  const [url, setUrl] = useState<string>(); const [page, setPage] = useState(1); const [note, setNote] = useState("");
  const documents = state.pdfDocuments.filter((document) => document.ownerType === ownerType && document.ownerRecordId === ownerRecordId);
  useEffect(() => {
    if (!active) return;
    let objectUrl: string | undefined;
    browserPdfStorage.get(active.storageKey).then((blob) => {
      if (!blob) { setError(l.missing); return; }
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => setError(l.missing));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); setUrl(undefined); };
  }, [active, l.missing]);
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    event.target.value = "";
    if (file.type !== "application/pdf" || file.size > 100 * 1024 * 1024) { setError(l.invalid); return; }
    const id = uid("pdf");
    try {
      await browserPdfStorage.put(id, file);
      mutate((draft) => draft.pdfDocuments.push({ ...nowEntity(id, draft.ownerId), ownerType, ownerRecordId,
        subjectId, chapterId, filename: file.name, mimeType: "application/pdf", size: file.size,
        storageKey: id, storage: "indexeddb", currentPage: 1 }));
      setError("");
    } catch { setError(l.failed); }
  }
  function open(document: BetaPdfDocument) {
    setError(""); setActive(document); setPage(document.currentPage);
    setNote(state.pdfNotes.find((entry) => entry.documentId === document.id && entry.page === document.currentPage)?.content ?? "");
  }
  function changePage(next: number) {
    if (!active || !Number.isInteger(next) || next < 1 || next > 100000) return;
    setPage(next); setNote(state.pdfNotes.find((entry) => entry.documentId === active.id && entry.page === next)?.content ?? "");
    mutate((draft) => { const document = draft.pdfDocuments.find((entry) => entry.id === active.id); if (document) { document.currentPage = next; if (document.ownerType === "book" && document.pageCount) { const book = draft.books.find((entry) => entry.id === document.ownerRecordId); if (book) book.progress = Math.min(100, Math.round(next / document.pageCount * 100)); } } });
  }
  function changeTotal(total: number) {
    if (!active || !Number.isInteger(total) || total < 1 || total > 100000) return;
    mutate((draft) => { const document = draft.pdfDocuments.find((entry) => entry.id === active.id); if (document) { document.pageCount = total; if (document.ownerType === "book") { const book = draft.books.find((entry) => entry.id === document.ownerRecordId); if (book) book.progress = Math.min(100, Math.round(document.currentPage / total * 100)); } } });
  }
  function saveNote() {
    if (!active) return;
    mutate((draft) => {
      const existing = draft.pdfNotes.find((entry) => entry.documentId === active.id && entry.page === page);
      if (existing) { existing.content = note; existing.updatedAt = new Date().toISOString(); }
      else draft.pdfNotes.push({ ...nowEntity(uid("pdf-note"), draft.ownerId), documentId: active.id, page, content: note });
    });
  }
  function linkKnowledge() {
    if (!active || !note.trim()) return;
    mutate((draft) => {
      const linkedId = `${active.id}:${page}`;
      let record = draft.notes.find((entry) => entry.linkedType === "pdf-page" && entry.linkedId === linkedId);
      if (record) { record.content = note; record.updatedAt = new Date().toISOString(); }
      else { record = { ...nowEntity(uid("note"), draft.ownerId), title: `${active.filename} · ${page}`,
        content: note, tags: ["pdf"], subjectId: active.subjectId, linkedType: "pdf-page", linkedId, favorite: false }; draft.notes.push(record); }
      const pdfNote = draft.pdfNotes.find((entry) => entry.documentId === active.id && entry.page === page);
      if (pdfNote) pdfNote.knowledgeNoteId = record.id;
      else draft.pdfNotes.push({ ...nowEntity(uid("pdf-note"), draft.ownerId), documentId: active.id, page, content: note, knowledgeNoteId: record.id });
    });
  }
  async function remove(document: BetaPdfDocument) {
    if (!window.confirm(l.remove + "?")) return;
    try { await browserPdfStorage.remove(document.storageKey); } catch { setError(l.failed); return; }
    mutate((draft) => { draft.pdfDocuments = draft.pdfDocuments.filter((entry) => entry.id !== document.id); draft.pdfNotes = draft.pdfNotes.filter((entry) => entry.documentId !== document.id); });
    if (active?.id === document.id) setActive(null);
  }
  return <Card padding="sm"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="type-h3 text-primary">{l.files}</h3><label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-border px-4 type-small text-primary hover:bg-surface-muted">{l.add}<input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(event) => void upload(event)} /></label></div>
    <p className="type-caption mt-3 text-muted">{l.local}</p>{error ? <p className="type-small mt-2 text-error" role="alert">{error}</p> : null}
    <div className="mt-4 grid gap-2">{documents.length ? documents.map((document) => <div key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"><span className="min-w-0 break-all type-small text-primary">{document.filename}</span><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => active?.id === document.id ? setActive(null) : open(document)}>{active?.id === document.id ? l.close : l.open}</Button><Button size="sm" variant="ghost" onClick={() => void remove(document)}>{l.remove}</Button></div></div>) : <p className="type-small text-secondary">{l.noFiles}</p>}</div>
    {active && url ? <div className="mt-5 grid gap-4"><div className="grid gap-3 tablet:grid-cols-2"><Field label={l.page}><input type="number" min="1" max="100000" className={fieldClass} value={page} onChange={(event) => changePage(Number(event.target.value))} /></Field><Field label={l.pages}><input type="number" min="1" max="100000" className={fieldClass} defaultValue={active.pageCount} onBlur={(event) => changeTotal(Number(event.target.value))} /></Field></div><a href={`${url}#page=${page}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-accent hover:underline">{l.external} ↗</a><iframe title={active.filename} src={`${url}#page=${page}`} className="h-[65dvh] w-full rounded-md border border-border bg-surface" /><Field label={l.note}><textarea className={areaClass} value={note} onChange={(event) => setNote(event.target.value)} /></Field><div className="flex flex-wrap gap-2"><Button onClick={saveNote}>{l.save}</Button><Button variant="secondary" onClick={linkKnowledge} disabled={!note.trim()}>{l.knowledge}</Button></div></div> : null}
  </Card>;
}
