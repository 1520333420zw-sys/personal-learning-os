import { notFound } from "next/navigation";

import { StudyPlanScreen } from "@/features/study-plan";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export default async function StudyPlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <StudyPlanScreen locale={locale} dictionary={getDictionary(locale)} />;
}
