import { notFound } from "next/navigation";
import { EnglishCenter } from "@/features/beta/english-center";
import { isLocale } from "@/i18n/config";
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <EnglishCenter locale={locale} />;
}
