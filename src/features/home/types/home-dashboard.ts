import type {
  ReviewStatus,
  ReviewType,
  StudySessionType,
  TaskPriority,
  TaskStatus,
} from "@/domain";

export interface HomeOverviewViewModel {
  studyMinutes: number;
  completedTasks: number;
  totalTasks: number;
  dueReviews: number;
}

export interface HomeTaskViewModel {
  id: string;
  title: string;
  targetType: string;
  estimatedMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface HomeReviewViewModel {
  id: string;
  title: string;
  targetLabel: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  timing: "today" | "overdue";
  scheduledLabel: string;
}

export interface HomeSubjectViewModel {
  id: string;
  name: string;
  href: string;
  chapterCount: number;
  todayMinutes: number;
  lastStudiedLabel: string;
}

export interface HomeSessionViewModel {
  id: string;
  subjectName: string;
  targetLabel: string;
  sessionType: StudySessionType;
  durationMinutes: number;
  startedAtLabel: string;
}

export interface HomeQuickActionViewModel {
  id: string;
  label: string;
  href: string;
}

export interface HomeDashboardData {
  dateLabel: string;
  overview: HomeOverviewViewModel;
  tasks: readonly HomeTaskViewModel[];
  reviews: readonly HomeReviewViewModel[];
  subjects: readonly HomeSubjectViewModel[];
  recentSessions: readonly HomeSessionViewModel[];
  quickActions: readonly HomeQuickActionViewModel[];
}
