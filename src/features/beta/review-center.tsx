"use client";

import { Badge, Button, Card } from "@/components/ui";
import { applyReviewRating, type ReviewRating } from "@/domain/review/review-engine";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { addLocalDays } from "@/lib/date";
import { BetaPage, EmptyState, localDate } from "./shared";

export function ReviewCenter({locale}:{locale:Locale}) {
  const {state,mutate}=useBetaData(); const today=localDate(); const tomorrow=addLocalDays(today,1); const week=addLocalDays(today,7); const en=locale==="en";
  const rows=[
    {id:"overdue",label:en?"Overdue":"逾期",items:state.reviewItems.filter((item)=>item.status==="due"&&item.dueDate<today)},
    {id:"today",label:en?"Today":"今天",items:state.reviewItems.filter((item)=>item.status==="due"&&item.dueDate===today)},
    {id:"tomorrow",label:en?"Tomorrow":"明天",items:state.reviewItems.filter((item)=>item.status==="due"&&item.dueDate===tomorrow)},
    {id:"week",label:en?"Next 7 days":"未来 7 天",items:state.reviewItems.filter((item)=>item.status==="due"&&item.dueDate>tomorrow&&item.dueDate<=week)},
  ];
  function rate(id:string,rating:ReviewRating){mutate((draft)=>{const item=draft.reviewItems.find((entry)=>entry.id===id);if(item)applyReviewRating(item,rating);});}
  return <BetaPage title={en?"Review center":"复习中心"} description={en?"Ebbinghaus checkpoints adjusted by your recall feedback.":"以艾宾浩斯节点为基础，再根据 Again / Hard / Good / Easy 动态调整。"}><div className="grid gap-7">{rows.map((row)=><section key={row.id}><h2 className="type-h2 text-primary">{row.label} <span className="type-small text-muted">{row.items.length}</span></h2><div className="mt-3 grid gap-3">{row.items.length?row.items.map((item)=><Card key={item.id} padding="sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><Badge variant={row.id==="overdue"?"warm":"neutral"}>{item.kind}</Badge><Badge variant="neutral">{item.dueDate}</Badge></div><h3 className="type-h3 mt-2 text-primary">{item.title}</h3><p className="type-small mt-2 text-secondary">{item.scheduleReason??(en?"Scheduled spaced review":"按间隔复习计划到期")}</p></div><div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">{(["again","hard","good","easy"] as const).map((rating)=><Button key={rating} size="sm" variant="secondary" onClick={()=>rate(item.id,rating)}>{rating[0].toUpperCase()+rating.slice(1)}</Button>)}</div></div></Card>):<EmptyState>{en?"No items.":"没有复习项目。"}</EmptyState>}</div></section>)}</div></BetaPage>;
}
