import { notFound } from "next/navigation";
import { HealthScreen } from "@/features/beta/life-tools";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <HealthScreen locale={locale}/>;}
