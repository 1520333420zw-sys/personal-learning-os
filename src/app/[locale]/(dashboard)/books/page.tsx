import { notFound } from "next/navigation";
import { BooksScreen } from "@/features/beta/life-tools";
import { BooksPdf } from "@/features/beta/books-pdf";
import { BookDiscovery } from "@/features/beta/book-discovery";
import { isLocale } from "@/i18n/config";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <><BookDiscovery locale={locale}/><BooksScreen locale={locale}/><BooksPdf locale={locale}/></>;}
