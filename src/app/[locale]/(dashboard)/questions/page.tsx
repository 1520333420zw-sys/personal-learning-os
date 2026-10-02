import { notFound } from "next/navigation";
import { QuestionCenter } from "@/features/beta/question-center";
import { isLocale } from "@/i18n/config";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <QuestionCenter locale={locale}/>;
}
