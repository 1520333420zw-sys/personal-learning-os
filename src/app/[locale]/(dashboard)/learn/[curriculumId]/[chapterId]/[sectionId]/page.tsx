import { notFound } from "next/navigation";
import { LessonScreen } from "@/features/learning-experience";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string; curriculumId: string; chapterId: string; sectionId: string }> }) {
  const { locale, curriculumId, chapterId, sectionId } = await params; if (!isLocale(locale)) notFound();
  return <LessonScreen locale={locale} curriculumId={curriculumId} chapterId={chapterId} sectionId={sectionId}/>;
}
