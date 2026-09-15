import { getDictionary, type PageKey } from "@/i18n";
import type { Locale } from "@/i18n/config";

import { PlaceholderPage } from "./placeholder-page";

export interface LocalizedPlaceholderPageProps {
  locale: Locale;
  pageKey: PageKey;
}

export function LocalizedPlaceholderPage({
  locale,
  pageKey,
}: LocalizedPlaceholderPageProps) {
  const dictionary = getDictionary(locale);

  return (
    <PlaceholderPage
      page={dictionary.pages[pageKey]}
      comingSoon={dictionary.common.comingSoon}
    />
  );
}
