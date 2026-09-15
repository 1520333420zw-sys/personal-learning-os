import { notFound } from "next/navigation";

import { createCoreLearningDataContext, createNewsRepository } from "@/data";
import { HomeDashboard, HomeDashboardService } from "@/features/home";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  const context = createCoreLearningDataContext();
  const data = await new HomeDashboardService(
    context,
    locale,
    dictionary,
    createNewsRepository(locale),
  ).getDashboard();

  return (
    <HomeDashboard data={data} dictionary={dictionary} locale={locale} />
  );
}
