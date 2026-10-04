import { notFound } from "next/navigation";
import { SubjectCurriculumOverview } from "@/features/learning-experience/psychology-center-v4";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <SubjectCurriculumOverview locale={locale} subjectId="subject-politics" title={locale==="en"?"Politics":"政治"} description={locale==="en"?"Follow modules, chapters and sections through learning, practice, recall and review.":"按模块、章、节完成学习、刷题、背诵与复习。"}/>;}
