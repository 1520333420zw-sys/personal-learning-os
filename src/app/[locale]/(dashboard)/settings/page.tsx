import { notFound } from "next/navigation";
import { CloudAccountPanel } from "@/features/beta/cloud-account-panel";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <CloudAccountPanel locale={locale}/>;}
