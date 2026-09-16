import { notFound } from "next/navigation";
import { SubjectCenter } from "@/features/beta/subject-center";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <SubjectCenter locale={locale} slug="psychology"/>;}
