import type { BetaTask, PlanningProfile } from "@/domain/beta";

export type PlanChange =
  | { kind: "add"; title: string; subjectId: string; date: string; minutes: number; reason: string }
  | { kind: "move"; taskId: string; date: string; reason: string };

export interface PlanContext {
  today: string; subjectIds: string[]; tasks: Pick<BetaTask, "id" | "title" | "subjectId" | "date" | "plannedMinutes" | "actualMinutes" | "status" | "planningControl">[];
  profile: PlanningProfile;
  recentStudy: { subjectId?: string; minutes: number; date: string }[];
  dueReviews: { kind: string; title: string; dueDate: string }[];
  mastery: { subjectId: string; newCount: number; learningCount: number; masteredCount: number }[];
}

export function dayCapacity(profile: PlanningProfile, date: string): number {
  const override = profile.days.find((day) => day.date === date);
  return override ? override.availableMinutes : profile.dailyMinutes;
}

export function isLocalDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() + 1 === month && parsed.getDate() === day;
}

export function parsePlanChanges(value: unknown, context: PlanContext): PlanChange[] | null {
  if (!value || typeof value !== "object" || !Array.isArray((value as { changes?: unknown }).changes)) return null;
  const proposed = (value as { changes: unknown[] }).changes;
  if (proposed.length > 24) return null;
  const changes: PlanChange[] = [];
  const movedTaskIds = new Set<string>();
  for (const raw of proposed) {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    if (!isLocalDateKey(item.date) || item.date < context.today || item.date > addDays(context.today, 13)) return null;
    if (typeof item.reason !== "string" || item.reason.length > 300) return null;
    if (item.kind === "add") {
      if (typeof item.title !== "string" || item.title.trim().length < 2 || item.title.length > 120 ||
        typeof item.subjectId !== "string" || !context.subjectIds.includes(item.subjectId) ||
        typeof item.minutes !== "number" || !Number.isInteger(item.minutes) || item.minutes < 5 || item.minutes > 480) return null;
      changes.push({ kind: "add", title: item.title.trim(), subjectId: item.subjectId, date: item.date, minutes: item.minutes, reason: item.reason });
    } else if (item.kind === "move") {
      if (typeof item.taskId !== "string") return null;
      const task = context.tasks.find((entry) => entry.id === item.taskId);
      if (!task || task.planningControl !== "adjustable" || task.status === "completed" || movedTaskIds.has(item.taskId)) return null;
      movedTaskIds.add(item.taskId);
      changes.push({ kind: "move", taskId: item.taskId, date: item.date, reason: item.reason });
    } else return null;
  }
  // Keep each day's proposed workload within the available time recorded by the user.
  for (const date of new Set(changes.map((change) => change.date))) {
    const movedAway = new Set(changes.filter((change) => change.kind === "move" && change.date !== date).map((change) => change.kind === "move" ? change.taskId : ""));
    const existing = context.tasks.filter((task) => task.date === date && task.status !== "completed" && !movedAway.has(task.id)).reduce((sum, task) => sum + Math.max(0, task.plannedMinutes - task.actualMinutes), 0);
    const added = changes.filter((change) => change.kind === "add" && change.date === date).reduce((sum, change) => sum + (change.kind === "add" ? change.minutes : 0), 0);
    const moved = changes.filter((change) => change.kind === "move" && change.date === date && context.tasks.find((task) => task.id === change.taskId)?.date !== date).reduce((sum, change) => sum + (change.kind === "move" ? context.tasks.find((task) => task.id === change.taskId)?.plannedMinutes ?? 0 : 0), 0);
    if (existing + added + moved > dayCapacity(context.profile, date)) return null;
  }
  return changes;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(year, month - 1, day + days);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, "0")}-${String(result.getDate()).padStart(2, "0")}`;
}
