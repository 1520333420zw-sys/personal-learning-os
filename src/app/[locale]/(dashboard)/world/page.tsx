import { notFound } from "next/navigation";
import { WorldScreen } from "@/features/beta/life-tools";
import { ResourceDiscovery } from "@/features/beta/resource-discovery";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <><ResourceDiscovery locale={locale}/><WorldScreen locale={locale}/></>;}
