"use client";

import { useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import type { ExternalResult } from "@/data/contracts/external-providers";
import type { Locale } from "@/i18n/config";

export function CurrentAffairs({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const [items, setItems] = useState<ExternalResult[]>([]);
  const [status, setStatus] = useState<"loading" | "unconfigured" | "error" | "ready">("loading");
  const l = locale === "en" ? { title: "Political current affairs", unconfigured: "No live current-affairs source is configured.", error: "The current-affairs source is unavailable.", empty: "No current-affairs items were returned.", source: "Source", original: "Original report" } : { title: "考研政治时政", unconfigured: "尚未配置实时时政数据源", error: "时政来源暂不可用。", empty: "来源暂无时政内容。", source: "来源", original: "查看原文" };
  useEffect(() => { const controller = new AbortController(); fetch("/api/current-affairs", { signal: controller.signal }).then(async (response) => {
    const data: { configured?: boolean; items?: ExternalResult[] } = await response.json();
    if (!response.ok) setStatus("error"); else if (!data.configured) setStatus("unconfigured"); else { setItems(data.items ?? []); setStatus("ready"); }
  }).catch((error: unknown) => { if (error instanceof Error && error.name !== "AbortError") setStatus("error"); }); return () => controller.abort(); }, []);
  return <section className="grid gap-3">{!compact ? <h2 className="type-h2 text-primary">{l.title}</h2> : null}{status === "unconfigured" ? <Card variant="muted"><p className="type-body text-secondary">{l.unconfigured}</p></Card> : null}{status === "error" ? <Card variant="muted"><p className="type-body text-error" role="alert">{l.error}</p></Card> : null}{status === "ready" && !items.length ? <Card variant="muted"><p className="type-body text-secondary">{l.empty}</p></Card> : null}{items.slice(0, compact ? 3 : undefined).map((item) => <Card key={item.url} padding="sm"><Badge variant="neutral">{item.category ?? l.title}</Badge><h3 className="type-h3 mt-2 text-primary">{item.title}</h3><p className="type-small mt-2 text-secondary">{item.summary}</p><p className="type-caption mt-2 text-muted">{l.source}: {item.source}{item.publishedAt ? ` · ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(item.publishedAt))}` : ""}</p><a className="mt-3 inline-flex min-h-11 items-center text-accent hover:underline" href={item.url} target="_blank" rel="noreferrer">{l.original} ↗</a></Card>)}</section>;
}
