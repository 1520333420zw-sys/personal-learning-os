import { notFound } from "next/navigation";
import { ReadingScreen } from "@/features/beta/learning-tools";
import { ReadingDiscovery } from "@/features/beta/reading-discovery";
import { ReadingLearning } from "@/features/beta/reading-learning";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <><ReadingDiscovery locale={locale}/><ReadingScreen locale={locale}/><ReadingLearning locale={locale}/></>;}
