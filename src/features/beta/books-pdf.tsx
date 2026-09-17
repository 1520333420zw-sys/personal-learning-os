"use client";

import { useState, type ChangeEvent } from "react";
import { Card } from "@/components/ui";
import { browserPdfStorage } from "@/data/storage/pdf-storage";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { nowEntity, uid } from "./shared";
import { PdfLibrary } from "./pdf-library";

export function BooksPdf({ locale }: { locale: Locale }) {
  const { state, mutate } = useBetaData(); const [error, setError] = useState("");
  const l = locale === "en" ? { title: "PDF library", import: "Import PDF as book", invalid: "Choose a PDF smaller than 100 MB.", failed: "Could not save PDF in this browser." } : { title: "PDF 书库", import: "导入 PDF 为书籍", invalid: "请选择小于 100 MB 的 PDF。", failed: "浏览器无法保存 PDF。" };
  async function importBook(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; event.target.value = "";
    if (file.type !== "application/pdf" || file.size > 100 * 1024 * 1024) { setError(l.invalid); return; }
    const bookId = uid("book"); const pdfId = uid("pdf");
    try {
      await browserPdfStorage.put(pdfId, file);
      mutate((draft) => {
        draft.books.push({ ...nowEntity(bookId, draft.ownerId), title: file.name.replace(/\.pdf$/i, ""), author: "", status: "want", progress: 0, notes: "", favorite: false, pdfDocumentId: pdfId });
        draft.pdfDocuments.push({ ...nowEntity(pdfId, draft.ownerId), ownerType: "book", ownerRecordId: bookId,
          filename: file.name, mimeType: "application/pdf", size: file.size, storageKey: pdfId, storage: "indexeddb", currentPage: 1 });
      }); setError("");
    } catch { setError(l.failed); }
  }
  return <section className="page-container mt-8 grid gap-4"><Card padding="sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="type-h2 text-primary">{l.title}</h2><label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-border px-4 type-small text-primary hover:bg-surface-muted">{l.import}<input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => void importBook(event)} /></label></div>{error ? <p role="alert" className="mt-2 text-error">{error}</p> : null}</Card>
    {state.books.map((book) => <PdfLibrary key={book.id} locale={locale} ownerType="book" ownerRecordId={book.id} />)}
  </section>;
}
