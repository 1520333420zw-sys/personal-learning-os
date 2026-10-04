import { notFound } from "next/navigation";
import { PsychologyOverviewV4 } from "@/features/learning-experience/psychology-center-v4";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <PsychologyOverviewV4 locale={locale}/>;}
