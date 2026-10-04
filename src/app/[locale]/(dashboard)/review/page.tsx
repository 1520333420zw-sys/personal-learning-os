import { notFound } from "next/navigation";
import { ReviewCenter } from "@/features/beta/review-center";
import { isLocale } from "@/i18n/config";

export default async function Page({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params; if(!isLocale(locale))notFound(); return <ReviewCenter locale={locale}/>;
}
