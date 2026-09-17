import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();redirect(`/${locale}/english`);}
