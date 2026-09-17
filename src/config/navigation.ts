export type NavigationGroup = "today" | "learn" | "knowledge" | "life";

export type NavigationKey =
  | "home"
  | "plan"
  | "psychology"
  | "politics"
  | "universal"
  | "vocabulary"
  | "recitation"
  | "reading"
  | "books"
  | "focus"
  | "world"
  | "knowledge"
  | "health"
  | "finance"
  | "growth";

export type NavigationIcon =
  | "home"
  | "calendar"
  | "brain"
  | "politics"
  | "language"
  | "recitation"
  | "article"
  | "book"
  | "timer"
  | "world"
  | "knowledge"
  | "health"
  | "finance"
  | "growth";

export interface NavigationItem {
  id: NavigationKey;
  labelKey: NavigationKey;
  href: string;
  group: NavigationGroup;
  icon: NavigationIcon;
  mobilePrimary: boolean;
}

export const navigationItems: readonly NavigationItem[] = [
  { id: "home", labelKey: "home", href: "", group: "today", icon: "home", mobilePrimary: true },
  { id: "plan", labelKey: "plan", href: "/plan", group: "today", icon: "calendar", mobilePrimary: true },
  { id: "focus", labelKey: "focus", href: "/focus", group: "today", icon: "timer", mobilePrimary: true },
  { id: "psychology", labelKey: "psychology", href: "/psychology", group: "learn", icon: "brain", mobilePrimary: false },
  { id: "politics", labelKey: "politics", href: "/politics", group: "learn", icon: "politics", mobilePrimary: false },
  { id: "vocabulary", labelKey: "vocabulary", href: "/english", group: "learn", icon: "language", mobilePrimary: false },
  { id: "universal", labelKey: "universal", href: "/learn", group: "learn", icon: "knowledge", mobilePrimary: false },
  { id: "recitation", labelKey: "recitation", href: "/recitation", group: "learn", icon: "recitation", mobilePrimary: false },
  { id: "reading", labelKey: "reading", href: "/reading", group: "learn", icon: "article", mobilePrimary: false },
  { id: "knowledge", labelKey: "knowledge", href: "/knowledge", group: "knowledge", icon: "knowledge", mobilePrimary: false },
  { id: "books", labelKey: "books", href: "/books", group: "knowledge", icon: "book", mobilePrimary: false },
  { id: "world", labelKey: "world", href: "/world", group: "knowledge", icon: "world", mobilePrimary: true },
  { id: "health", labelKey: "health", href: "/health", group: "life", icon: "health", mobilePrimary: false },
  { id: "finance", labelKey: "finance", href: "/finance", group: "life", icon: "finance", mobilePrimary: false },
  { id: "growth", labelKey: "growth", href: "/growth", group: "life", icon: "growth", mobilePrimary: false },
];
