import { notFound } from "next/navigation";
import { StudyHistoryPage } from "@/features/beta/study-history";
import { isLocale } from "@/i18n/config";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <StudyHistoryPage locale={locale} />;
}
