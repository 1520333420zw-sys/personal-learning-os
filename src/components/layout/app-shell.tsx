import type { ReactNode } from "react";

import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";

import { AppNavigation } from "../navigation/app-navigation";
import { GlobalSearch } from "@/features/beta/global-search";

export interface AppShellProps {
  children: ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}

export function AppShell({ children, locale, dictionary }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <AppNavigation locale={locale} dictionary={dictionary} />
      <div className="min-w-0 pb-24 tablet:ml-[5.5rem] tablet:pb-0 desktop:ml-64">
        <GlobalSearch locale={locale} />
        {children}
      </div>
    </div>
  );
}
