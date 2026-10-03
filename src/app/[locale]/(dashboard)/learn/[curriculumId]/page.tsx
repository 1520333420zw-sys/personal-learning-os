import { notFound } from "next/navigation";
import { CourseOverview } from "@/features/learning-experience";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string; curriculumId: string }> }) {
  const { locale, curriculumId } = await params; if (!isLocale(locale)) notFound();
  return <CourseOverview locale={locale} curriculumId={curriculumId}/>;
}
