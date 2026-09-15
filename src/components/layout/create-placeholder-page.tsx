import { notFound } from "next/navigation";

import type { PageKey } from "@/i18n";
import { isLocale } from "@/i18n/config";

import { LocalizedPlaceholderPage } from "./localized-placeholder-page";

interface RoutePageProps {
  params: Promise<{ locale: string }>;
}

export function createPlaceholderPage(pageKey: PageKey) {
  return async function PlaceholderRoutePage({ params }: RoutePageProps) {
    const { locale } = await params;

    if (!isLocale(locale)) {
      notFound();
    }

    return <LocalizedPlaceholderPage locale={locale} pageKey={pageKey} />;
  };
}
