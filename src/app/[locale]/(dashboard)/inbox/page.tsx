import { notFound } from "next/navigation";
import { ExternalWritesPage } from "@/features/beta/external-writes-panel";
import { isLocale } from "@/i18n/config";

export default async function InboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <ExternalWritesPage locale={locale} />;
}
