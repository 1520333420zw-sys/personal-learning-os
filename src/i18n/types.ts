import type { NavigationKey } from "@/config/navigation";

export type PageKey = NavigationKey;

export interface PageMessage {
  title: string;
  description: string;
}

export interface HomeMessages {
  greeting: string;
  encouragement: string;
  overview: { studyTime: string; tasks: string; reviews: string; minutes: string };
  sections: {
    tasks: string; tasksDescription: string; reviews: string; reviewsDescription: string;
    subjects: string; subjectsDescription: string; recent: string; recentDescription: string;
    quickActions: string; quickActionsDescription: string;
  };
  empty: { tasks: string; reviews: string; sessions: string };
  actions: { viewPlan: string; openSubject: string };
  taskStatus: Record<"todo" | "in_progress" | "completed" | "cancelled", string>;
  priority: Record<"low" | "medium" | "high", string>;
  reviewType: Record<"vocabulary" | "recitation" | "question" | "knowledgePoint" | "custom", string>;
  reviewTiming: { today: string; overdue: string };
  sessionType: Record<"learning" | "review" | "practice" | "recitation" | "reading", string>;
  targetType: Record<"subject" | "chapter" | "knowledgePoint" | "vocabulary" | "recitation" | "questionBank" | "question" | "reading" | "book" | "custom", string>;
  knownTargets: { generalPsychology: string; marxism: string };
  subject: {
    psychology: string; politics: string; english: string; chapters: string;
    studiedToday: string; noStudyToday: string; lastStudied: string; notStarted: string;
  };
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
  home: HomeMessages;
}
