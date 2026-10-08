import { notFound } from "next/navigation";
import { LessonScreen } from "@/features/learning-experience";
import type { SectionLearningMode } from "@/features/learning-experience/psychology-section-pages";
import { isLocale } from "@/i18n/config";

const modes = new Set<SectionLearningMode>(["practice", "past-papers", "recitation"]);

export default async function Page({ params }: { params: Promise<{ locale: string; curriculumId: string; chapterId: string; sectionId: string; mode: string }> }) {
  const { locale, curriculumId, chapterId, sectionId, mode } = await params;
  if (!isLocale(locale) || !modes.has(mode as SectionLearningMode)) notFound();
  return <LessonScreen locale={locale} curriculumId={curriculumId} chapterId={chapterId} sectionId={sectionId} mode={mode as SectionLearningMode}/>;
}
