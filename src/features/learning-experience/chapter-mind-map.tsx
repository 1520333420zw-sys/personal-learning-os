"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui";
import type { BetaKnowledgePoint, BetaQuestion } from "@/domain/beta";
import type { CurriculumChapter, CurriculumSection } from "@/domain/learning/curriculum";
import type { Locale } from "@/i18n/config";

const branchStyles = [
  { line: "border-accent", node: "border-accent bg-accent-soft" },
  { line: "border-success", node: "border-success bg-success-soft" },
  { line: "border-warning", node: "border-warning bg-warm-oat-soft" },
  { line: "border-error", node: "border-error bg-dusty-rose-soft" },
];

export function ChapterMindMap({ locale, curriculumId, chapter, sections, points, questions=[] }: { locale: Locale; curriculumId: string; chapter: CurriculumChapter; sections: CurriculumSection[]; points: BetaKnowledgePoint[]; questions?: BetaQuestion[] }) {
  const frame=useRef<HTMLDivElement>(null); const [scale,setScale]=useState(.9); const [offset,setOffset]=useState({x:0,y:0}); const [mode,setMode]=useState<"full"|"exam"|"recall"|"past">("full"); const [collapsed,setCollapsed]=useState<string[]>([]); const drag=useRef<{x:number;y:number;ox:number;oy:number}|null>(null);
  const textbookSections=sections.filter((item)=>item.kind!=="chapter_review");
  const labels=locale==="en"?["Full map","Exam points","Recall mode","Past papers"]:["完整导图","只看考点","背诵模式","真题模式"];
  function down(event:PointerEvent<HTMLDivElement>){if((event.target as HTMLElement).closest("a,button"))return;drag.current={x:event.clientX,y:event.clientY,ox:offset.x,oy:offset.y};event.currentTarget.setPointerCapture(event.pointerId);}
  function move(event:PointerEvent<HTMLDivElement>){if(!drag.current)return;setOffset({x:drag.current.ox+event.clientX-drag.current.x,y:drag.current.oy+event.clientY-drag.current.y});}
  return <section>
    <div className="flex flex-col gap-3 border-b border-border pb-4 tablet:flex-row tablet:items-center tablet:justify-between"><div className="flex gap-2 overflow-x-auto">{(["full","exam","recall","past"] as const).map((value,index)=><Button key={value} size="sm" variant={mode===value?"primary":"secondary"} onClick={()=>setMode(value)}>{labels[index]}</Button>)}</div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={()=>setScale((value)=>Math.min(1.8,value+.1))}>＋</Button><Button size="sm" variant="secondary" onClick={()=>setScale((value)=>Math.max(.45,value-.1))}>−</Button><Button size="sm" variant="secondary" onClick={()=>{setScale(.78);setOffset({x:0,y:0});}}>{locale==="en"?"Fit":"适应宽度"}</Button><Button size="sm" variant="secondary" onClick={()=>{setScale(.9);setOffset({x:0,y:0});setCollapsed([]);}}>{locale==="en"?"Reset":"重置"}</Button><Button size="sm" variant="secondary" onClick={()=>void frame.current?.requestFullscreen()}>{locale==="en"?"Full screen":"全屏"}</Button></div></div>
    <div ref={frame} className="mt-4 h-[38rem] cursor-grab overflow-hidden rounded-lg border border-border bg-surface-muted touch-none active:cursor-grabbing" onPointerDown={down} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
      <div className="flex min-h-full min-w-[105rem] items-center px-12 py-10 transition-transform" style={{transform:`translate(${offset.x}px, ${offset.y}px) scale(${scale})`,transformOrigin:"left center"}}>
        <div className="relative flex w-64 shrink-0 items-center"><div className="z-10 w-56 rounded-xl border-2 border-accent bg-surface-raised px-6 py-5 text-center shadow-soft"><p className="type-caption text-muted">{locale==="en"?"Chapter":"本章"}</p><p className="type-h3 mt-2 text-primary">{locale==="en"?chapter.titleEn:chapter.title}</p></div><div className="h-0 w-8 border-t-2 border-accent"/></div>
        <div className="relative grid w-[84rem] gap-5 border-l-2 border-border-strong py-6">{textbookSections.map((section,index)=>{const branch=branchStyles[index%branchStyles.length];const hidden=collapsed.includes(section.id);const sectionPoints=section.knowledgePointIds.map((id)=>points.find((item)=>item.id===id)).filter(Boolean) as BetaKnowledgePoint[];return <div key={section.id} className="relative flex min-h-24 items-center pl-10"><div className={`absolute left-0 top-1/2 h-0 w-10 border-t-2 ${branch.line}`}/><div className={`relative w-52 shrink-0 rounded-lg border-2 px-4 py-3 ${branch.node}`}><Link draggable={false} href={`/${locale}/learn/${curriculumId}/${chapter.id}/${section.id}`} className="type-label text-primary hover:underline">{locale==="en"?section.titleEn:section.title}</Link><button type="button" className="mt-2 block type-caption text-muted" aria-expanded={!hidden} onClick={()=>setCollapsed((current)=>hidden?current.filter((id)=>id!==section.id):[...current,section.id])}>{hidden?(locale==="en"?"Expand":"展开"):(locale==="en"?"Collapse":"收起")}</button></div>{hidden?null:<><div className={`h-0 w-8 shrink-0 border-t-2 ${branch.line}`}/><div className="grid min-w-[45rem] gap-3">{sectionPoints.map((point)=>{const verified=questions.filter((question)=>question.isOfficial===true&&typeof question.year==="number"&&question.knowledgePointId===point.id);if(mode==="past"&&!verified.length)return null;const examText=point.examFocus?.[0]??point.keyPoints;return <div key={point.id} className="flex items-center"><Link draggable={false} href={`/${locale}/learn/${curriculumId}/${chapter.id}/${section.id}#knowledge-${point.id}`} className={`w-56 rounded-md border border-border-strong bg-surface-raised px-4 py-3 type-small text-primary shadow-soft hover:border-accent ${mode==="recall"?"select-none text-transparent":""}`}>{locale==="en"?point.titleEn:point.title}</Link>{mode!=="recall"?<><div className={`h-0 w-6 border-t ${branch.line}`}/><Link draggable={false} href={`/${locale}/learn/${curriculumId}/${chapter.id}/${section.id}#exam-points`} className="max-w-72 rounded-md border border-border bg-surface px-3 py-2 type-caption text-secondary hover:border-accent">🎯 {examText.slice(0,72)}{verified.map((question)=><span key={question.id} className="ml-1 inline-flex rounded-full bg-warm-oat-soft px-2 py-0.5 text-xs text-primary">{question.year}</span>)}</Link></>:null}</div>})}</div></>}</div>})}</div>
      </div>
    </div>
  </section>;
}
