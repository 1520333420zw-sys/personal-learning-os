import { notFound } from "next/navigation";
import { UniversalCenter } from "@/features/beta/universal-center";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <UniversalCenter locale={locale} />;
}
