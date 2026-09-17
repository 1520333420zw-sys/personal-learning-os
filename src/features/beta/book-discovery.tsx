"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Badge, Button, Card } from "@/components/ui";
import type { BookSearchResult } from "@/data/contracts/book-provider";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { fieldClass, nowEntity, uid } from "./shared";

const lists = [
  { zh: "心理学入门", en: "Psychology", query: "introduction to psychology" },
  { zh: "数学基础", en: "Mathematics", query: "calculus introduction" },
  { zh: "物理入门", en: "Physics", query: "physics introduction" },
  { zh: "金融入门", en: "Finance", query: "finance introduction" },
  { zh: "历史", en: "History", query: "world history" },
  { zh: "哲学", en: "Philosophy", query: "philosophy introduction" },
  { zh: "计算机", en: "Computer science", query: "computer science introduction" },
  { zh: "英语阅读", en: "English reading", query: "English literature" },
];

export function BookDiscovery({ locale }: { locale: Locale }) {
  const { state, mutate } = useBetaData(); const en = locale === "en";
  const [query, setQuery] = useState(""); const [items, setItems] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [searched, setSearched] = useState(false);
  async function search(value: string) {
    if (value.trim().length < 2) return;
    setQuery(value); setLoading(true); setError(""); setSearched(true); setItems([]);
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(value.trim())}`);
      if (!response.ok) throw new Error();
      const payload: { items?: BookSearchResult[] } = await response.json();
      setItems(Array.isArray(payload.items) ? payload.items : []);
    } catch { setError(en ? "Open Library could not be reached. Try again later." : "暂时无法连接 Open Library，请稍后重试。"); }
    finally { setLoading(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void search(query); }
  function save(book: BookSearchResult) {
    if (state.books.some((item) => item.providerId === book.providerId)) return;
    mutate((draft) => draft.books.push({ ...nowEntity(uid("book"), draft.ownerId), title: book.title,
      author: book.authors.join(", "), status: "want", progress: 0, notes: "", favorite: false,
      providerId: book.providerId, sourceUrl: book.sourceUrl, isbn: book.isbn, coverUrl: book.coverUrl,
      firstPublishYear: book.firstPublishYear, language: book.language,
    }));
  }
  return <section className="page-container mt-8 grid gap-4"><Card padding="sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="type-h1 text-primary">{en ? "Discover real books" : "发现真实书籍"}</h1><p className="type-small mt-2 text-secondary">{en ? "Live metadata from Open Library. Results are not AI-generated recommendations." : "书籍元数据来自 Open Library 实时检索；书单是检索主题，不是未经核验的推荐。"}</p></div><Badge variant="neutral">Open Library</Badge></div><form className="mt-5 flex flex-col gap-2 tablet:flex-row" onSubmit={submit}><label className="sr-only" htmlFor="book-search">{en ? "Title, author, ISBN or subject" : "书名、作者、ISBN 或主题"}</label><input id="book-search" className={`${fieldClass} min-w-0 flex-1`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={en ? "Title, author, ISBN or subject" : "书名、作者、ISBN 或主题"} minLength={2} maxLength={120} required /><Button type="submit" disabled={loading}>{loading ? (en ? "Searching…" : "搜索中…") : (en ? "Search books" : "搜索书籍")}</Button></form><div className="mt-4 flex flex-wrap gap-2" aria-label={en ? "Reading list topics" : "书单主题"}>{lists.map((list) => <Button key={list.query} size="sm" variant="secondary" onClick={() => void search(list.query)}>{en ? list.en : list.zh}</Button>)}</div></Card>
    {error ? <Card padding="sm"><p role="alert" className="type-small text-error">{error}</p></Card> : null}
    {searched && !loading && !error && !items.length ? <Card padding="sm"><p className="type-small text-secondary">{en ? "No verified books found for this search." : "此搜索没有找到可核验的书籍。"}</p></Card> : null}
    {items.length ? <div className="grid gap-3 tablet:grid-cols-2">{items.map((book) => { const saved = state.books.some((item) => item.providerId === book.providerId); return <Card key={book.providerId} padding="sm" className="flex gap-4"><div className="h-28 w-20 shrink-0 overflow-hidden rounded-md bg-surface-muted">{book.coverUrl ? <Image unoptimized src={book.coverUrl} alt="" width={80} height={112} className="h-full w-full object-cover" /> : null}</div><div className="min-w-0 flex-1"><h3 className="type-label break-words text-primary">{book.title}</h3><p className="type-caption mt-1 text-muted">{book.authors.join(", ") || (en ? "Author unavailable" : "作者信息缺失")}{book.firstPublishYear ? ` · ${book.firstPublishYear}` : ""}</p>{book.isbn ? <p className="type-caption mt-1 text-muted">ISBN {book.isbn}</p> : null}<div className="mt-3 flex flex-wrap gap-2"><a className="inline-flex min-h-11 items-center rounded-md px-2 type-small text-accent hover:bg-surface-muted" href={book.sourceUrl} target="_blank" rel="noopener noreferrer">{en ? "Source ↗" : "来源 ↗"}</a><Button size="sm" variant="secondary" disabled={saved} onClick={() => save(book)}>{saved ? (en ? "On shelf" : "已在书架") : (en ? "Add to shelf" : "加入书架")}</Button></div></div></Card>; })}</div> : null}
  </section>;
}
