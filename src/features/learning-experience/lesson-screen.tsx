"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui";
import { buildCurriculumCatalog, buildTeachingUnit } from "@/domain";
import { BetaPage, nowEntity } from "@/features/beta/shared";
import type { Locale } from "@/i18n/config";
import { useBetaData } from "@/providers";
import { ChapterMindMap } from "./chapter-mind-map";
import { SectionLearningPages, type SectionLearningMode } from "./psychology-section-pages";

export function LessonScreen({ locale, curriculumId, chapterId, sectionId, mode = "study" }: { locale: Locale; curriculumId: string; chapterId: string; sectionId: string; mode?: SectionLearningMode }) {
  const { state, mutate } = useBetaData();
  const catalog = useMemo(() => buildCurriculumCatalog(state), [state]);
  const curriculum = catalog.curricula.find((item) => item.id === curriculumId);
  const chapter = catalog.chapters.find((item) => item.id === chapterId && item.curriculumId === curriculumId);
  const section = catalog.sections.find((item) => item.id === sectionId && item.chapterId === chapterId);
  const unit = section ? buildTeachingUnit(state, section) : null;
  const sections = catalog.sections.filter((item) => item.chapterId === chapterId).sort((a, b) => a.order - b.order);
  const courseChapters = catalog.chapters.filter((item) => item.curriculumId === curriculumId).sort((a, b) => a.order - b.order);
  const courseSections = courseChapters.flatMap((courseChapter) => catalog.sections.filter((item) => item.chapterId === courseChapter.id).sort((a, b) => a.order - b.order));
  const index = courseSections.findIndex((item) => item.id === sectionId);

  useEffect(() => {
    if (!curriculum || !chapter || !section) return;
    mutate((draft) => {
      const now = new Date().toISOString();
      let course = draft.courseProgress.find((item) => item.curriculumId === curriculum.id);
      if (!course) {
        course = { ...nowEntity(`course-progress-${curriculum.id}`, draft.ownerId), curriculumId: curriculum.id, startedAt: now, lastStudiedAt: now };
        draft.courseProgress.push(course);
      }
      course.lastChapterId = chapter.id; course.lastSectionId = section.id; course.lastStudiedAt = now;
      const progress = draft.sectionProgress.find((item) => item.sectionId === section.id);
      if (!progress) draft.sectionProgress.push({ ...nowEntity(`section-progress-${section.id}`, draft.ownerId), curriculumId: curriculum.id, chapterId: chapter.id, sectionId: section.id, status: "learning", lessonViewed: true, feynmanStatus: "pending", quickCheckCompleted: false, quickCheckCorrect: 0, quickCheckTotal: 0, startedAt: now, lastStudiedAt: now });
      else if (!progress.lessonViewed) { progress.lessonViewed = true; progress.lastStudiedAt = now; }
    });
    // A route change is the intentional start signal; progress updates must not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId, chapterId, sectionId]);

  if (!curriculum || !chapter || !section || !unit) return <BetaPage title={locale === "en" ? "Learning center" : "学习中心"} description=""><Card>{locale === "en" ? "Lesson not found." : "没有找到这一节课程。"}</Card></BetaPage>;
  if (section.kind === "chapter_review") return <BetaPage title={locale === "en" ? "Chapter mind map" : "章末思维导图"} description="" action={<Link href={`/${locale}/learn/${curriculum.id}`} className="type-label text-accent">← {locale === "en" ? "Back to course" : "返回课程"}</Link>}>
    <nav className="flex flex-wrap items-center gap-2 type-caption text-muted" aria-label={locale === "en" ? "Breadcrumb" : "面包屑"}><Link href={subjectHref(locale, curriculum.subjectId)} className="hover:text-accent">{subjectLabel(curriculum.subjectId, locale === "en")}</Link><span>›</span><Link href={`/${locale}/learn/${curriculum.id}`} className="hover:text-accent">{locale === "en" ? curriculum.titleEn : curriculum.title}</Link><span>›</span><span>{locale === "en" ? chapter.titleEn : chapter.title}</span><span>›</span><span className="text-primary">{locale === "en" ? "Chapter mind map" : "章末思维导图"}</span></nav>
    <ChapterMindMap locale={locale} curriculumId={curriculum.id} chapter={chapter} sections={sections} points={state.knowledgePoints} questions={state.questions}/>
  </BetaPage>;
  return <SectionLearningPages locale={locale} curriculum={curriculum} chapter={chapter} section={section} unit={unit} chapterSections={sections} previous={courseSections[index - 1]} next={courseSections[index + 1]} mode={mode}/>;
}

function subjectHref(locale: Locale, subjectId: string) { if (subjectId === "subject-psychology-312") return `/${locale}/psychology`; if (subjectId === "subject-politics") return `/${locale}/politics`; if (subjectId === "subject-english") return `/${locale}/english`; return `/${locale}/learn`; }
function subjectLabel(subjectId: string, en: boolean) { if (subjectId === "subject-psychology-312") return en ? "312 Psychology" : "312 心理学"; if (subjectId === "subject-politics") return en ? "Politics" : "政治"; if (subjectId === "subject-english") return en ? "English" : "英语"; return en ? "Learning Center" : "全科学习"; }
