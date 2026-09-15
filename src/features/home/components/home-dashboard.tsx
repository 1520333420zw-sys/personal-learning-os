import Link from "next/link";

import { Badge, Card, SectionHeader } from "@/components/ui";
import type { Dictionary } from "@/i18n";
import { cn } from "@/lib/cn";

import type { HomeDashboardData } from "../types";

interface HomeDashboardProps {
  data: HomeDashboardData;
  dictionary: Dictionary;
  locale: string;
}

const priorityVariant = {
  low: "neutral",
  medium: "accent",
  high: "warning",
} as const;

const statusVariant = {
  todo: "neutral",
  in_progress: "accent",
  completed: "success",
  cancelled: "error",
} as const;

export function HomeDashboard({ data, dictionary, locale }: HomeDashboardProps) {
  const messages = dictionary.home;

  return (
    <main className="page-container overflow-hidden">
      <div className="flex flex-col gap-10 tablet:gap-12 desktop:gap-14">
        <header className="max-w-3xl">
          <p className="type-label mb-3 text-muted">{data.dateLabel}</p>
          <h1 className="type-h1 text-primary">{messages.greeting}</h1>
          <p className="type-body mt-3 text-secondary">{messages.encouragement}</p>
        </header>

        <TodayOverview data={data} dictionary={dictionary} />

        <div className="grid min-w-0 gap-10 desktop:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.8fr)] desktop:items-start">
          <div className="flex min-w-0 flex-col gap-10 tablet:gap-12">
            <TodayTasks data={data} dictionary={dictionary} locale={locale} />
            <SubjectOverview data={data} dictionary={dictionary} />
          </div>
          <aside className="flex min-w-0 flex-col gap-10 tablet:grid tablet:grid-cols-2 desktop:flex desktop:grid-cols-none tablet:gap-8" aria-label={messages.sections.reviews}>
            <TodayReviews data={data} dictionary={dictionary} />
            <RecentStudy data={data} dictionary={dictionary} />
          </aside>
        </div>

        <QuickActions data={data} dictionary={dictionary} />
      </div>
    </main>
  );
}

function TodayOverview({ data, dictionary }: Omit<HomeDashboardProps, "locale">) {
  const { overview } = dictionary.home;
  const items = [
    { label: overview.studyTime, value: data.overview.studyMinutes, suffix: overview.minutes },
    { label: overview.tasks, value: `${data.overview.completedTasks} / ${data.overview.totalTasks}` },
    { label: overview.reviews, value: data.overview.dueReviews },
  ];

  return (
    <section aria-label={overview.studyTime} className="grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      {items.map((item, index) => (
        <div key={item.label} className={cn("min-w-0 px-3 py-5 tablet:px-6 tablet:py-6", index > 0 && "border-l border-border")}>
          <p className="type-caption truncate text-muted tablet:type-small">{item.label}</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-1 text-xl font-semibold tracking-[-0.02em] text-primary tablet:text-2xl">
            {item.value}
            {item.suffix ? <span className="text-xs font-normal text-secondary tablet:text-sm">{item.suffix}</span> : null}
          </p>
        </div>
      ))}
    </section>
  );
}

function TodayTasks({ data, dictionary, locale }: HomeDashboardProps) {
  const messages = dictionary.home;
  return (
    <section aria-labelledby="today-tasks-title">
      <SectionHeader titleId="today-tasks-title" title={messages.sections.tasks} description={messages.sections.tasksDescription} />
      <div className="mt-5 space-y-3">
        {data.tasks.length ? data.tasks.map((task) => (
          <Card key={task.id} padding="sm" variant={task.status === "completed" ? "muted" : "default"}>
            <div className="flex min-w-0 items-start gap-3">
              <span aria-hidden="true" className={cn("mt-1.5 size-3 shrink-0 rounded-full border", task.status === "completed" ? "border-success bg-success" : task.status === "in_progress" ? "border-accent bg-accent-soft" : "border-border-strong bg-surface")} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 tablet:flex-row tablet:items-start tablet:justify-between">
                  <div className="min-w-0">
                    <h3 className={cn("type-body font-medium text-primary", task.status === "completed" && "text-secondary line-through")}>{task.title}</h3>
                    <p className="type-small mt-1 text-muted">{task.targetType} · {task.estimatedMinutes} {messages.overview.minutes}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={priorityVariant[task.priority]}>{messages.priority[task.priority]}</Badge>
                    <Badge variant={statusVariant[task.status]}>{messages.taskStatus[task.status]}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )) : (
          <Card variant="muted">
            <p className="type-body text-secondary">{messages.empty.tasks}</p>
            <Link href={`/${locale}/plan`} className="type-label mt-4 inline-flex min-h-11 items-center rounded-md text-accent underline-offset-4 hover:underline">{messages.actions.viewPlan} →</Link>
          </Card>
        )}
      </div>
    </section>
  );
}

function TodayReviews({ data, dictionary }: Omit<HomeDashboardProps, "locale">) {
  const messages = dictionary.home;
  return (
    <section aria-labelledby="today-reviews-title">
      <SectionHeader titleId="today-reviews-title" title={messages.sections.reviews} description={messages.sections.reviewsDescription} />
      <Card className="mt-5" padding="sm">
        {data.reviews.length ? <ul className="divide-y divide-border">{data.reviews.map((review) => (
          <li key={review.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="type-label text-primary">{review.title}</p>
                <p className="type-small mt-1 break-words text-secondary">{review.targetLabel}</p>
              </div>
              <Badge variant={review.timing === "overdue" ? "warning" : "neutral"}>{messages.reviewTiming[review.timing]}</Badge>
            </div>
          </li>
        ))}</ul> : <p className="type-body text-secondary">{messages.empty.reviews}</p>}
      </Card>
    </section>
  );
}

function SubjectOverview({ data, dictionary }: Omit<HomeDashboardProps, "locale">) {
  const messages = dictionary.home;
  return (
    <section aria-labelledby="subjects-title">
      <SectionHeader titleId="subjects-title" title={messages.sections.subjects} description={messages.sections.subjectsDescription} />
      <div className="mt-5 grid gap-3 tablet:grid-cols-3">
        {data.subjects.map((subject) => (
          <Link key={subject.id} href={subject.href} className="group min-w-0 rounded-lg focus-visible:outline-none">
            <Card className="h-full transition-[border-color,box-shadow,transform] duration-[var(--duration-normal)] group-hover:-translate-y-0.5 group-hover:border-border-strong group-hover:shadow-card" padding="sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="type-h3 break-words text-primary">{subject.name}</h3>
                <span aria-hidden="true" className="text-muted transition-transform group-hover:translate-x-0.5">→</span>
              </div>
              <p className="type-small mt-5 text-secondary">{subject.chapterCount} {messages.subject.chapters}</p>
              <p className="type-small mt-1 text-secondary">{subject.todayMinutes ? `${messages.subject.studiedToday} ${subject.todayMinutes} ${messages.overview.minutes}` : messages.subject.noStudyToday}</p>
              <p className="type-caption mt-4 text-muted">{messages.subject.lastStudied} · {subject.lastStudiedLabel}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentStudy({ data, dictionary }: Omit<HomeDashboardProps, "locale">) {
  const messages = dictionary.home;
  return (
    <section aria-labelledby="recent-study-title">
      <SectionHeader titleId="recent-study-title" title={messages.sections.recent} description={messages.sections.recentDescription} />
      <Card className="mt-5" padding="sm" variant="muted">
        {data.recentSessions.length ? <ol className="divide-y divide-border">{data.recentSessions.map((session) => (
          <li key={session.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-3">
              <p className="type-label text-primary">{session.subjectName}</p>
              <time className="type-caption shrink-0 text-muted">{session.startedAtLabel}</time>
            </div>
            <p className="type-small mt-1 break-words text-secondary">{session.targetLabel}</p>
            <p className="type-caption mt-2 text-muted">{messages.sessionType[session.sessionType]} · {session.durationMinutes} {messages.overview.minutes}</p>
          </li>
        ))}</ol> : <p className="type-body text-secondary">{messages.empty.sessions}</p>}
      </Card>
    </section>
  );
}

function QuickActions({ data, dictionary }: Omit<HomeDashboardProps, "locale">) {
  const messages = dictionary.home;
  return (
    <section aria-labelledby="quick-actions-title">
      <SectionHeader titleId="quick-actions-title" title={messages.sections.quickActions} description={messages.sections.quickActionsDescription} />
      <div className="mt-5 grid grid-cols-2 gap-3 tablet:grid-cols-5">
        {data.quickActions.map((action) => (
          <Link key={action.id} href={action.href} className="flex min-h-14 items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 type-label text-primary shadow-soft transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-raised active:translate-y-0">{action.label}<span aria-hidden="true" className="text-muted">→</span></Link>
        ))}
      </div>
    </section>
  );
}
