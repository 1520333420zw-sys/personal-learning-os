import { notFound } from "next/navigation";
import { CourseWorkspace } from "@/features/learning-experience/psychology-center-v4";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string; curriculumId: string }> }) {
  const { locale, curriculumId } = await params; if (!isLocale(locale)) notFound();
  return <CourseWorkspace locale={locale} curriculumId={curriculumId}/>;
}
