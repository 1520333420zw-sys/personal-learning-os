"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import type { ExternalResult } from "@/data/contracts/external-providers";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { nowEntity, uid } from "./shared";

const categories = ["world", "economy", "technology", "education", "society", "culture"] as const;
export function ReadingDiscovery({ locale }: { locale: Locale }) {
  const { state, mutate } = useBetaData(); const [category, setCategory] = useState<string>("");
  const [items, setItems] = useState<ExternalResult[]>([]); const [status, setStatus] = useState<"loading" | "unconfigured" | "error" | "ready">("loading");
  const l = locale === "en" ? { title: "Live reading feed", unconfigured: "No live article source is configured. Your saved articles below remain available.", error: "The article provider is unavailable.", empty: "No articles returned.", source: "Source", original: "Open original", save: "Save article", saved: "Saved", all: "All", world: "World", economy: "Economy", technology: "Technology", education: "Education", society: "Society", culture: "Culture" } : { title: "外刊更新", unconfigured: "尚未配置实时外刊数据源。下方已保存的文章仍可使用。", error: "外刊来源暂不可用。", empty: "来源暂无文章。", source: "来源", original: "打开原文", save: "收藏文章", saved: "已收藏", all: "全部", world: "国际", economy: "经济", technology: "科技", education: "教育", society: "社会", culture: "文化" };
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reading-feed?category=${encodeURIComponent(category)}`, { signal: controller.signal }).then(async (response) => {
      const data: { configured?: boolean; items?: ExternalResult[] } = await response.json();
      if (!response.ok) setStatus("error"); else if (!data.configured) setStatus("unconfigured"); else { setItems(data.items ?? []); setStatus("ready"); }
    }).catch((error: unknown) => { if (error instanceof Error && error.name !== "AbortError") setStatus("error"); });
    return () => controller.abort();
  }, [category]);
  function save(item: ExternalResult) {
    mutate((draft) => { if (draft.reading.some((record) => record.url === item.url)) return;
      draft.reading.push({ ...nowEntity(uid("reading"), draft.ownerId), title: item.title, source: item.source, url: item.url,
        publishedDate: item.publishedAt?.slice(0, 10) ?? "", category: item.category ?? category,
        status: "unread", favorite: false, excerpt: "", notes: "", summary: "", vocabulary: [] }); });
  }
  return <section className="page-container mt-8 grid gap-4"><Card><h2 className="type-h2 text-primary">{l.title}</h2><div className="mt-4 flex max-w-full gap-2 overflow-x-auto">{["", ...categories].map((id) => <Button key={id} size="sm" variant={category === id ? "primary" : "secondary"} onClick={() => { setCategory(id); setStatus("loading"); }}>{id ? l[id as keyof typeof l] : l.all}</Button>)}</div></Card>
    {status === "unconfigured" ? <Card variant="muted"><p className="type-body text-secondary">{l.unconfigured}</p></Card> : null}
    {status === "error" ? <Card variant="muted"><p className="type-body text-error" role="alert">{l.error}</p></Card> : null}
    {status === "ready" && !items.length ? <Card variant="muted"><p className="type-body text-secondary">{l.empty}</p></Card> : null}
    {items.map((item) => <Card key={item.url} padding="sm"><Badge variant="neutral">{item.category ?? l.title}</Badge><h3 className="type-h3 mt-2 text-primary">{item.title}</h3><p className="type-small mt-2 text-secondary">{item.summary}</p><p className="type-caption mt-2 text-muted">{l.source}: {item.source} {item.publishedAt ? `· ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(item.publishedAt))}` : ""}</p><div className="mt-3 flex flex-wrap gap-3"><a className="inline-flex min-h-11 items-center text-accent hover:underline" href={item.url} target="_blank" rel="noreferrer">{l.original} ↗</a><Button size="sm" variant="secondary" disabled={state.reading.some((record) => record.url === item.url)} onClick={() => save(item)}>{state.reading.some((record) => record.url === item.url) ? l.saved : l.save}</Button></div></Card>)}
  </section>;
}
