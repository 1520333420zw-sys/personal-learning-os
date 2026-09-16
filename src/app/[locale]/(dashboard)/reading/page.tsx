import { notFound } from "next/navigation";
import { ReadingScreen } from "@/features/beta/learning-tools";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <ReadingScreen locale={locale}/>;}
