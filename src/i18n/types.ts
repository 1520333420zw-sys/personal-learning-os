import type { NavigationKey } from "@/config/navigation";

export type PageKey = NavigationKey;

export interface PageMessage {
  title: string;
  description: string;
}

export interface Dictionary {
  brand: {
    name: string;
    shortName: string;
    tagline: string;
  };
  common: {
    comingSoon: string;
    more: string;
    close: string;
    primaryNavigation: string;
    lifeNavigation: string;
    mobileNavigation: string;
    switchLanguage: string;
    designSystem: string;
  };
  navigation: Record<NavigationKey, string>;
  pages: Record<PageKey, PageMessage>;
}
