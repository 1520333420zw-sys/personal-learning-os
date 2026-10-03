"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Badge, Button, Card } from "@/components/ui";
import type { BetaVocabulary, BetaVocabularyProgress } from "@/domain/beta";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { areaClass, EmptyState, Field, fieldClass, localDate, Modal, nowEntity, Tabs, uid } from "./shared";
import { applyReviewRating, reviewDefaults } from "@/domain/review/review-engine";

interface SystemVocabularyEntry {
  id: string; word: string; phonetic: string; partOfSpeech: string; meanings: string[];
  commonMeaningsInExam: string[]; definition: string; collocations: string[]; wordFamily: string[];
  example: string; synonyms: string[]; antonyms: string[]; difficulty: "easy" | "medium" | "hard";
  frequencyTier: "high" | "medium" | "low"; tags: string[]; sourceCategory: string; contentPackVersion: string;
}
interface VocabularyPack { packId: string; version: string; itemCount: number; checksum: string; items: SystemVocabularyEntry[]; }
interface WordView {
  id: string; word: string; phonetic: string; meaning: string; example: string; familiarity: BetaVocabulary["familiarity"];
  favorite: boolean; reviewCount: number; nextReviewAt?: string; system?: SystemVocabularyEntry;
}

const labels = {
  "zh-CN": { add: "添加单词", search: "搜索单词", all: "今日单词", review: "今日复习", favorite: "收藏", mastered: "已掌握", know: "认识", vague: "模糊", unknown: "不认识", word: "单词", phonetic: "音标", meaning: "中文释义", example: "例句", save: "保存", close: "关闭", empty: "当前考试分类下还没有符合条件的单词。", export: "导出词库", import: "导入词库", invalid: "导入失败：请选择本系统导出的有效词库 JSON。", loadMore: "加载更多", pack: "系统词库", loading: "正在加载系统词库…", unavailable: "系统词库暂时无法加载，个人词汇仍可使用。", total: "个词条" },
  en: { add: "Add word", search: "Search words", all: "Today's words", review: "Due reviews", favorite: "Favorites", mastered: "Mastered", know: "Know", vague: "Vague", unknown: "Don't know", word: "Word", phonetic: "Phonetic", meaning: "Meaning", example: "Example", save: "Save", close: "Close", empty: "No matching words in this exam category.", export: "Export words", import: "Import words", invalid: "Import failed. Choose a valid vocabulary JSON exported by this app.", loadMore: "Load more", pack: "System vocabulary", loading: "Loading the system vocabulary…", unavailable: "The system vocabulary could not be loaded. Personal words remain available.", total: "entries" },
};

const defaultProgress = (): BetaVocabularyProgress => ({ familiarity: "new", favorite: false, reviewCount: 0, updatedAt: "" });

export function EnglishVocabulary({ locale, exam }: { locale: Locale; exam: BetaVocabulary["examType"] }) {
  const l = labels[locale]; const { state, mutate } = useBetaData(); const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState(""); const [open, setOpen] = useState(false); const [error,setError]=useState(""); const input=useRef<HTMLInputElement>(null); const today = localDate();
  const [pack,setPack]=useState<VocabularyPack|null>(null);const[packError,setPackError]=useState(false);const[limit,setLimit]=useState(40);
  useEffect(()=>{let active=true;void fetch("/content/english/vocabulary-v1.json").then((response)=>{if(!response.ok)throw new Error("pack");return response.json() as Promise<VocabularyPack>;}).then((value)=>{if(active&&value.itemCount===value.items.length)setPack(value);}).catch(()=>{if(active)setPackError(true);});return()=>{active=false;};},[]);

  const words=useMemo(()=>{const q=query.trim().toLowerCase();const system:WordView[]=exam==="english1"?(pack?.items??[]).map((entry)=>{const progress=state.contentVocabularyState?.[entry.id]??defaultProgress();return{id:entry.id,word:entry.word,phonetic:entry.phonetic,meaning:entry.commonMeaningsInExam.join("；"),example:entry.example,familiarity:progress.familiarity,favorite:progress.favorite,reviewCount:progress.reviewCount,nextReviewAt:progress.nextReviewAt,system:entry};}):[];const personal:WordView[]=state.vocabulary.filter((entry)=>entry.examType===exam).map((entry)=>({...entry}));return[...system,...personal].filter((entry)=>`${entry.word} ${entry.meaning} ${entry.system?.definition??""}`.toLowerCase().includes(q)&&(filter==="all"||filter==="review"&&!!entry.nextReviewAt&&entry.nextReviewAt<=today||filter==="favorite"&&entry.favorite||filter==="mastered"&&entry.familiarity==="mastered"));},[exam,filter,pack,query,state.contentVocabularyState,state.vocabulary,today]);

  function rate(word: WordView, value: "known" | "vague" | "new") {
    mutate((draft) => {
      const count = word.reviewCount + 1; const familiarity = value === "known" && count >= 3 ? "mastered" : value;
      let review=draft.reviewItems.find((item)=>item.kind==="vocabulary"&&item.targetId===word.id&&item.status==="due");
      if(!review){review={...nowEntity(uid("review"),draft.ownerId),kind:"vocabulary",targetId:word.id,title:word.word,dueDate:today,status:"due",subjectId:draft.subjects.find((item)=>item.slug==="english")?.id,...reviewDefaults("vocabulary")};draft.reviewItems.push(review);}
      applyReviewRating(review,value==="new"?"again":value==="vague"?"hard":"good");const nextReviewAt=familiarity==="mastered"?undefined:review.dueDate;if(familiarity==="mastered")review.status="mastered";const updatedAt=new Date().toISOString();
      if(word.system){draft.contentVocabularyState??={};draft.contentVocabularyState[word.id]={familiarity,favorite:word.favorite,reviewCount:count,lastReviewedAt:updatedAt,nextReviewAt,updatedAt};}
      else {const record=draft.vocabulary.find((item)=>item.id===word.id);if(record)Object.assign(record,{familiarity,reviewCount:count,lastReviewedAt:updatedAt,nextReviewAt,updatedAt});}
    });
  }
  function toggleFavorite(word:WordView){mutate((draft)=>{const updatedAt=new Date().toISOString();if(word.system){draft.contentVocabularyState??={};draft.contentVocabularyState[word.id]={...(draft.contentVocabularyState[word.id]??defaultProgress()),favorite:!word.favorite,updatedAt};}else{const record=draft.vocabulary.find((item)=>item.id===word.id);if(record){record.favorite=!record.favorite;record.updatedAt=updatedAt;}}});}
  function add(event: FormEvent<HTMLFormElement>) {event.preventDefault();const form=new FormData(event.currentTarget);const word=String(form.get("word")??"").trim();const meaning=String(form.get("meaning")??"").trim();if(!word||!meaning)return;mutate((draft)=>draft.vocabulary.push({...nowEntity(uid("word"),draft.ownerId),word,meaning,phonetic:String(form.get("phonetic")??""),example:String(form.get("example")??""),examType:exam,familiarity:"new",favorite:false,reviewCount:0,nextReviewAt:today}));setOpen(false);}
  function exportWords(){const data=state.vocabulary.filter((word)=>word.examType===exam);const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,exam,words:data},null,2)],{type:"application/json"}));const anchor=document.createElement("a");anchor.href=url;anchor.download=`personal-learning-os-vocabulary-${exam}.json`;anchor.click();URL.revokeObjectURL(url);}
  async function importWords(file?:File){if(!file)return;try{const value=JSON.parse(await file.text()) as {version?:unknown;words?:unknown};if(value.version!==1||!Array.isArray(value.words))throw new Error("invalid");const imported=value.words.filter((item):item is BetaVocabulary=>Boolean(item)&&typeof item==="object"&&typeof(item as BetaVocabulary).word==="string"&&typeof(item as BetaVocabulary).meaning==="string");if(imported.length!==value.words.length)throw new Error("invalid");mutate((draft)=>{const keys=new Set(draft.vocabulary.map((word)=>`${word.examType}:${word.word.toLowerCase()}`));for(const word of imported){const key=`${word.examType}:${word.word.toLowerCase()}`;if(!keys.has(key)){draft.vocabulary.push({...word,id:uid("word"),ownerId:draft.ownerId,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});keys.add(key);}}});setError("");}catch{setError(l.invalid);}finally{if(input.current)input.current.value="";}}
  return <section className="grid gap-4"><div className="flex flex-wrap items-end justify-between gap-3"><Field label={l.search} className="min-w-52 flex-1"><input className={fieldClass} value={query} onChange={(event)=>{setQuery(event.target.value);setLimit(40);}}/></Field><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={exportWords}>{l.export}</Button><Button variant="secondary" onClick={()=>input.current?.click()}>{l.import}</Button><Button onClick={()=>setOpen(true)}>{l.add}</Button><input ref={input} hidden type="file" accept="application/json" onChange={(event)=>void importWords(event.target.files?.[0])}/></div></div>{error?<p role="alert" className="type-small text-error">{error}</p>:null}
    {exam==="english1"?<p className="type-small text-secondary">{pack?`${l.pack} · ${pack.itemCount} ${l.total} · ECDICT (MIT)`:packError?l.unavailable:l.loading}</p>:null}
    <Tabs label={l.word} value={filter} onChange={(value)=>{setFilter(value);setLimit(40);}} items={(["all","review","favorite","mastered"] as const).map((id)=>({id,label:l[id]}))}/>
    <div className="grid gap-3 tablet:grid-cols-2">{words.length?words.slice(0,limit).map((word)=><Card key={word.id} padding="sm"><div className="flex justify-between gap-2"><div><div className="flex flex-wrap items-center gap-2"><h2 className="type-h3 text-primary">{word.word}</h2>{word.system?<Badge variant="neutral">{word.system.frequencyTier}</Badge>:null}</div><p className="type-caption mt-1 text-muted">{word.phonetic}{word.system?.partOfSpeech?` · ${word.system.partOfSpeech}`:""}</p></div><Button size="sm" variant="ghost" onClick={()=>toggleFavorite(word)}>{word.favorite?"★":"☆"} {l.favorite}</Button></div><p className="type-body mt-3 text-secondary">{word.meaning}</p>{word.system?.definition?<p className="type-small mt-2 text-muted">{word.system.definition}</p>:null}{word.system?.wordFamily.length?<p className="type-caption mt-2 text-muted">Word family: {word.system.wordFamily.join(" · ")}</p>:null}{word.example?<p className="type-small mt-2 text-muted">{word.example}</p>:null}<div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={()=>rate(word,"known")}>{l.know}</Button><Button size="sm" variant="secondary" onClick={()=>rate(word,"vague")}>{l.vague}</Button><Button size="sm" variant="secondary" onClick={()=>rate(word,"new")}>{l.unknown}</Button>{word.nextReviewAt?<Badge variant="neutral">{word.nextReviewAt}</Badge>:null}</div></Card>):<EmptyState>{l.empty}</EmptyState>}</div>
    {words.length>limit?<Button className="justify-self-center" variant="secondary" onClick={()=>setLimit((value)=>value+40)}>{l.loadMore} · {Math.min(limit,words.length)} / {words.length}</Button>:null}
    {open?<Modal title={l.add} closeLabel={l.close} onClose={()=>setOpen(false)}><form onSubmit={add} className="grid gap-4"><Field label={l.word}><input autoFocus required name="word" className={fieldClass}/></Field><Field label={l.phonetic}><input name="phonetic" className={fieldClass}/></Field><Field label={l.meaning}><input required name="meaning" className={fieldClass}/></Field><Field label={l.example}><textarea name="example" className={areaClass}/></Field><Button type="submit">{l.save}</Button></form></Modal>:null}
  </section>;
}
