import { notFound } from "next/navigation";

import { BetaStudyPlan } from "@/features/beta/study-plan";
import { isLocale } from "@/i18n/config";

export default async function StudyPlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <BetaStudyPlan locale={locale} />;
}
