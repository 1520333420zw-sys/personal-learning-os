"use client";

import Link from "next/link";
import { Badge, Card, Progress } from "@/components/ui";
import { buildCurriculumCatalog, buildTeachingUnit, resolveContinueLearning } from "@/domain";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { BetaPage } from "@/features/beta/shared";

const isPsychology = (id: string) => id.startsWith("curriculum-psych-");
const todayKey = () => new Date().toLocaleDateString("sv-SE");

export function PsychologyOverviewV4({ locale }: { locale: Locale }) {
  const { state } = useBetaData();
  const catalog = buildCurriculumCatalog(state);
  const books = catalog.curricula.filter((item) => item.subjectId === "subject-psychology-312");
  const sectionIds = new Set(catalog.sections.filter((section) => catalog.chapters.some((chapter) => chapter.curriculumId && books.some((book) => book.id === chapter.curriculumId) && chapter.id === section.chapterId)).map((item) => item.id));
  const today = todayKey();
  const todayMinutes = state.studySessions.filter((item) => item.subjectId === "subject-psychology-312" && item.startedAt.slice(0, 10) === today).reduce((sum, item) => sum + item.durationMinutes, 0);
  const due = state.reviewItems.filter((item) => item.subjectId === "subject-psychology-312" && item.status === "due" && item.dueDate <= today).length;
  const questionIds = new Set(state.questions.filter((item) => item.subjectId === "subject-psychology-312").map((item) => item.id));
  const wrong = state.wrongQuestions.filter((item) => questionIds.has(item.questionId) && !item.mastered).length;
  const mastered = state.sectionProgress.filter((item) => sectionIds.has(item.sectionId) && item.status === "completed").length;
  const stats = locale === "en" ? [["Study today", `${todayMinutes} min`], ["Due review", String(due)], ["Mistakes", String(wrong)], ["Mastered", String(mastered)]] : [["今日学习", `${todayMinutes} 分钟`], ["待复习", String(due)], ["错题", String(wrong)], ["已掌握", String(mastered)]];
  return <BetaPage title={locale === "en" ? "312 Psychology" : "312 心理学"} description="">
    <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">{stats.map(([label,value])=><Card key={label} padding="sm"><p className="type-caption text-muted">{label}</p><p className="type-h2 mt-2 text-primary">{value}</p></Card>)}</div>
    <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">{books.map((book)=>{
      const chapters=catalog.chapters.filter((item)=>item.curriculumId===book.id); const sections=catalog.sections.filter((item)=>chapters.some((chapter)=>chapter.id===item.chapterId));
      const completed=state.sectionProgress.filter((item)=>sections.some((section)=>section.id===item.sectionId)&&item.status==="completed").length; const percent=sections.length?Math.round(completed/sections.length*100):0;
      const progress=state.courseProgress.find((item)=>item.curriculumId===book.id); const next=sections.find((section)=>!state.sectionProgress.some((item)=>item.sectionId===section.id&&item.status==="completed"))??sections[0];
      return <Card key={book.id} className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><div><h2 className="type-h3 text-primary">{locale==="en"?book.titleEn:book.title}</h2><p className="type-small mt-2 text-secondary">{[book.author,book.edition].filter(Boolean).join(" · ")}</p></div>{book.status==="needs_pdf_calibration"?<Badge variant="warm">{locale==="en"?"Calibration pending":"待教材校准"}</Badge>:null}</div><div className="mt-6 flex items-center justify-between type-caption text-muted"><span>{locale==="en"?`${chapters.length} chapters`:`${chapters.length} 章`}</span><span>{percent}%</span></div><Progress className="mt-2" value={percent}/><Link href={`/${locale}/learn/${book.id}${next?`#${next.id}`:""}`} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-accent bg-accent px-4 type-label text-white hover:bg-accent-hover">{progress?(locale==="en"?"Continue":"继续学习"):(locale==="en"?"Start":"开始学习")} →</Link></Card>;
    })}</div>
  </BetaPage>;
}

export function PsychologyCourseWorkspace({ locale, curriculumId }: { locale: Locale; curriculumId: string }) {
  const { state } = useBetaData(); const catalog=buildCurriculumCatalog(state); const course=catalog.curricula.find((item)=>item.id===curriculumId&&isPsychology(item.id));
  if(!course)return <BetaPage title="312 心理学" description=""><Card>{locale==="en"?"Textbook not found.":"没有找到这本教材。"}</Card></BetaPage>;
  const chapters=catalog.chapters.filter((item)=>item.curriculumId===course.id).sort((a,b)=>a.order-b.order); const continued=resolveContinueLearning(state,{...catalog,curricula:[course]});
  const activeChapter=continued?.chapter??chapters[0]; const sections=catalog.sections.filter((item)=>item.chapterId===activeChapter?.id).sort((a,b)=>a.order-b.order); const activeSection=(continued?.section&&continued.section.chapterId===activeChapter?.id?continued.section:null)??sections.find((item)=>item.kind!=="chapter_review")??sections[0]; const unit=activeSection?buildTeachingUnit(state,activeSection):null;
  return <BetaPage title={locale==="en"?course.titleEn:course.title} description={[course.author,course.edition].filter(Boolean).join(" · ")} action={<Link href={`/${locale}/psychology`} className="type-label text-accent">← {locale==="en"?"312 Psychology":"七本教材"}</Link>}>
    <div className="grid gap-6 desktop:grid-cols-[19rem_minmax(0,1fr)] desktop:items-start">
      <aside className="rounded-lg border border-border bg-surface p-3 desktop:sticky desktop:top-6"><p className="type-caption px-2 pb-3 text-muted">{locale==="en"?"Textbook contents":"教材目录"}</p>{chapters.map((chapter)=>{const chapterSections=catalog.sections.filter((item)=>item.chapterId===chapter.id).sort((a,b)=>a.order-b.order);const completed=chapterSections.filter((section)=>state.sectionProgress.some((item)=>item.sectionId===section.id&&item.status==="completed")).length;const current=chapter.id===activeChapter?.id;return <details key={chapter.id} open={current} className="border-t border-border py-2"><summary className={`cursor-pointer rounded-md px-2 py-2 type-small ${current?"bg-accent-soft text-primary":"text-secondary"}`}><span className="font-medium">{locale==="en"?chapter.titleEn:chapter.title}</span><span className="ml-2 text-muted">{completed}/{chapterSections.length}</span></summary><div className="mt-1 grid gap-1 pl-2">{chapterSections.map((section)=>{const done=state.sectionProgress.some((item)=>item.sectionId===section.id&&item.status==="completed");const selected=section.id===activeSection?.id;return <Link key={section.id} href={`/${locale}/learn/${course.id}/${chapter.id}/${section.id}`} className={`flex min-h-10 items-center justify-between rounded-md px-3 type-caption ${selected?"bg-surface-muted font-medium text-primary":"text-secondary hover:bg-surface-muted"}`}><span>{locale==="en"?section.titleEn:section.title}</span><span>{done?"✓":section.kind==="chapter_review"?"⌘":""}</span></Link>})}</div></details>})}</aside>
      <main className="min-w-0"><Card variant="elevated"><Badge variant={activeSection?.sourceStatus==="verified"?"neutral":"warm"}>{activeSection?.sourceStatus==="verified"?(locale==="en"?"Outline verified":"目录已核验"):(locale==="en"?"Calibration pending":"待教材校准")}</Badge><p className="type-caption mt-5 text-muted">{locale==="en"?activeChapter?.titleEn:activeChapter?.title}</p><h2 className="type-h1 mt-2 text-primary">{locale==="en"?activeSection?.titleEn:activeSection?.title}</h2><p className="type-small mt-3 text-secondary">{activeSection?.sourceNote}</p><div className="mt-7 grid gap-3 tablet:grid-cols-2">{activeSection?.knowledgePointIds.map((id,index)=>{const point=state.knowledgePoints.find((item)=>item.id===id);const displayTitle=unit?.learningObjectives[index]??(locale==="en"?point?.titleEn:point?.title);return point?<Link key={id} href={`/${locale}/learn/${course.id}/${activeChapter.id}/${activeSection.id}#knowledge-${id}`} className="rounded-md border border-border bg-surface-muted p-4 hover:border-border-strong"><span className="type-caption text-muted">{String(index+1).padStart(2,"0")}</span><h3 className="type-h3 mt-2 text-primary">{displayTitle}</h3><p className="type-small mt-2 line-clamp-2 text-secondary">{point.coreConcept}</p></Link>:null})}</div>{!activeSection?.knowledgePointIds.length&&unit?<p className="mt-6 rounded-md bg-surface-muted p-4 type-body text-secondary">{unit.summary}</p>:null}<div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">{["教材内容","本节考点","历年真题","本节刷题","费曼复述","我的笔记"].map((label)=><Link key={label} href={`/${locale}/learn/${course.id}/${activeChapter.id}/${activeSection.id}`} className="inline-flex min-h-10 items-center rounded-md border border-border px-3 type-label text-secondary hover:bg-surface-muted">{locale==="en"?({"教材内容":"Textbook","本节考点":"Exam points","历年真题":"Past papers","本节刷题":"Practice","费曼复述":"Feynman","我的笔记":"Notes"} as Record<string,string>)[label]:label}</Link>)}</div></Card></main>
    </div>
  </BetaPage>;
}
