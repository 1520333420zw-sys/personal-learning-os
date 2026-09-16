import { notFound } from "next/navigation";
import { PomodoroPanel } from "@/features/beta/pomodoro";
import { BetaPage } from "@/features/beta/shared";
import { getBetaMessages } from "@/i18n/beta-messages";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const m=getBetaMessages(locale);return <BetaPage title={m.focus.title} description={m.focus.subtitle}><PomodoroPanel locale={locale}/></BetaPage>;}
