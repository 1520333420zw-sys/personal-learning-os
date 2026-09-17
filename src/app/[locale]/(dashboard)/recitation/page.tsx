import { notFound } from "next/navigation";
import { RecitationCenter } from "@/features/beta/recitation-center";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <RecitationCenter locale={locale}/>;}
