export type NavigationGroup = "main" | "life";

export type NavigationKey =
  | "home"
  | "plan"
  | "psychology"
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
  { id: "home", labelKey: "home", href: "", group: "main", icon: "home", mobilePrimary: true },
  { id: "plan", labelKey: "plan", href: "/plan", group: "main", icon: "calendar", mobilePrimary: true },
  { id: "psychology", labelKey: "psychology", href: "/psychology", group: "main", icon: "brain", mobilePrimary: false },
  { id: "vocabulary", labelKey: "vocabulary", href: "/vocabulary", group: "main", icon: "language", mobilePrimary: false },
  { id: "recitation", labelKey: "recitation", href: "/recitation", group: "main", icon: "recitation", mobilePrimary: false },
  { id: "reading", labelKey: "reading", href: "/reading", group: "main", icon: "article", mobilePrimary: false },
  { id: "books", labelKey: "books", href: "/books", group: "main", icon: "book", mobilePrimary: false },
  { id: "focus", labelKey: "focus", href: "/focus", group: "main", icon: "timer", mobilePrimary: true },
  { id: "world", labelKey: "world", href: "/world", group: "main", icon: "world", mobilePrimary: true },
  { id: "knowledge", labelKey: "knowledge", href: "/knowledge", group: "main", icon: "knowledge", mobilePrimary: false },
  { id: "health", labelKey: "health", href: "/health", group: "life", icon: "health", mobilePrimary: false },
  { id: "finance", labelKey: "finance", href: "/finance", group: "life", icon: "finance", mobilePrimary: false },
  { id: "growth", labelKey: "growth", href: "/growth", group: "life", icon: "growth", mobilePrimary: false },
];
