import { notFound } from "next/navigation";
import { PsychologyBookCenter } from "@/features/learning-experience";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <PsychologyBookCenter locale={locale}/>;}
