"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Badge, Button, Card } from "@/components/ui";
import type { ExternalResult } from "@/data/contracts/external-providers";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { Field, fieldClass, nowEntity, uid } from "./shared";

export function ResourceDiscovery({ locale }: { locale: Locale }) {
  const { state, mutate } = useBetaData(); const [query, setQuery] = useState(""); const [items, setItems] = useState<ExternalResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "unconfigured" | "error" | "ready">("idle");
  const l = locale === "en" ? { title: "Discover resources", saved: "My resources", search: "Search learning resources online", submit: "Search", unconfigured: "Online resource search is not configured. You can still save resources manually below.", error: "The search provider is unavailable. Please try again later.", empty: "No results from the configured provider.", save: "Save to my resources", already: "Saved", source: "Source", thirdParty: "Third-party source (not verified as official)" } : { title: "发现资源", saved: "我的资源", search: "联网搜索学习资源", submit: "搜索", unconfigured: "尚未配置联网资源搜索。下方仍可手动保存资源。", error: "搜索服务暂不可用，请稍后重试。", empty: "当前服务未返回结果。", save: "保存到我的资源", already: "已保存", source: "来源", thirdParty: "第三方来源（未核实官方属性）" };
  useEffect(() => { fetch("/api/resource-search?status=1").then((response) => response.json()).then((data: { configured?: boolean }) => { if (!data.configured) setStatus("unconfigured"); }).catch(() => setStatus("error")); }, []);
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (query.trim().length < 2) return; setStatus("loading"); setItems([]);
    try {
      const response = await fetch(`/api/resource-search?q=${encodeURIComponent(query.trim())}`);
      const data: { configured?: boolean; items?: ExternalResult[] } = await response.json();
      if (!response.ok) setStatus("error"); else if (!data.configured) setStatus("unconfigured");
      else { setItems(data.items ?? []); setStatus("ready"); }
    } catch { setStatus("error"); }
  }
  function save(item: ExternalResult) {
    mutate((draft) => { if (draft.resources.some((resource) => resource.url === item.url)) return;
      draft.resources.push({ ...nowEntity(uid("resource"), draft.ownerId), name: item.title, url: item.url,
        category: "website", description: [item.source, item.summary].filter(Boolean).join(" · "), examCategory: "", tags: [], favorite: false }); });
  }
  return <section className="page-container mt-8 grid gap-5"><Card><h2 className="type-h2 text-primary">{l.title}</h2><form onSubmit={(event) => void search(event)} className="mt-4 flex flex-col gap-2 tablet:flex-row tablet:items-end"><Field label={l.search} className="flex-1"><input value={query} onChange={(event) => setQuery(event.target.value)} minLength={2} className={fieldClass} /></Field><Button type="submit" disabled={status === "loading"}>{l.submit}</Button></form></Card>
    {status === "unconfigured" ? <Card variant="muted"><p className="type-body text-secondary">{l.unconfigured}</p></Card> : null}
    {status === "error" ? <Card variant="muted"><p className="type-body text-error" role="alert">{l.error}</p></Card> : null}
    {status === "ready" && !items.length ? <Card variant="muted"><p className="type-body text-secondary">{l.empty}</p></Card> : null}
    {items.map((item) => <Card key={item.url} padding="sm"><Badge variant="neutral">{l.thirdParty}</Badge><h3 className="type-h3 mt-2 text-primary">{item.title}</h3><p className="type-small mt-2 text-secondary">{item.summary}</p><p className="type-caption mt-2 text-muted">{l.source}: {item.source}</p><div className="mt-3 flex flex-wrap gap-2"><a href={item.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center break-all text-accent hover:underline">{item.url}</a><Button size="sm" variant="secondary" disabled={state.resources.some((resource) => resource.url === item.url)} onClick={() => save(item)}>{state.resources.some((resource) => resource.url === item.url) ? l.already : l.save}</Button></div></Card>)}
    <h2 className="type-h2 text-primary">{l.saved}</h2>
  </section>;
}
