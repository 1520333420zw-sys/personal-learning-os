import { notFound } from "next/navigation";
import { CourseOverview } from "@/features/learning-experience";
import { PsychologyCourseWorkspace } from "@/features/learning-experience/psychology-center-v4";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string; curriculumId: string }> }) {
  const { locale, curriculumId } = await params; if (!isLocale(locale)) notFound();
  return curriculumId.startsWith("curriculum-psych-") ? <PsychologyCourseWorkspace locale={locale} curriculumId={curriculumId}/> : <CourseOverview locale={locale} curriculumId={curriculumId}/>;
}
