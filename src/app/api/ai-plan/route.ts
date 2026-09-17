import { NextResponse } from "next/server";
import { configuredAIProvider } from "@/data/providers/configured-ai";
import { isLocalDateKey, parsePlanChanges, type PlanContext } from "@/domain/planning/ai-plan";

export async function GET() { return NextResponse.json({ configured: Boolean(configuredAIProvider()) }); }

export async function POST(request: Request) {
  const provider = configuredAIProvider();
  if (!provider) return NextResponse.json({ configured: false, error: "AI provider not configured" }, { status: 503 });
  let body: { context?: unknown; instruction?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const context = body.context as PlanContext | undefined;
  if (!context || !isLocalDateKey(context.today) || !Array.isArray(context.subjectIds) || context.subjectIds.length > 30 ||
    context.subjectIds.some((id) => typeof id !== "string" || id.length > 100) ||
    !Array.isArray(context.tasks) || context.tasks.length > 300 || !Array.isArray(context.recentStudy) || context.recentStudy.length > 30 ||
    !Array.isArray(context.dueReviews) || context.dueReviews.length > 30 || !Array.isArray(context.mastery) || context.mastery.length > 30 || !context.profile ||
    !Number.isInteger(context.profile.dailyMinutes) || context.profile.dailyMinutes < 0 || context.profile.dailyMinutes > 960 ||
    !Array.isArray(context.profile.days) || context.profile.days.length > 30 || context.profile.days.some((day) =>
      !day || !isLocalDateKey(day.date) || !Number.isInteger(day.availableMinutes) || day.availableMinutes < 0 || day.availableMinutes > 960 ||
      !["work", "rest", "half", "special"].includes(day.kind) || !["low", "medium", "high"].includes(day.energy)) ||
    context.tasks.some((task) => !task || typeof task.id !== "string" || !isLocalDateKey(task.date) ||
      !Number.isInteger(task.plannedMinutes) || !Number.isInteger(task.actualMinutes) || task.plannedMinutes < 0 || task.actualMinutes < 0) ||
    typeof body.instruction !== "string" || body.instruction.length > 500) return NextResponse.json({ error: "Invalid planning context" }, { status: 400 });
  const system = `You are a study-planning assistant. Return exactly one JSON object: {"changes":[...]}. Allowed changes: {"kind":"add","title":string,"subjectId":knownId,"date":YYYY-MM-DD,"minutes":integer 5..480,"reason":string} or {"kind":"move","taskId":knownId,"date":YYYY-MM-DD,"reason":string}. Never delete tasks. Never move a locked, manual or completed task. Use actualMinutes and available daily minutes. Dates must be from local today through 13 days ahead. Respect exam date, shift schedule, weak subjects, review needs, priorities and user request. Do not promise an outcome or invent past-paper statistics. Return empty changes if no safe modification is warranted. The server validates your proposal; it will only be a preview until user confirms.`;
  try {
    const raw = await provider.generateJson(system, JSON.stringify({ instruction: body.instruction, context }));
    const changes = parsePlanChanges(raw, context);
    if (!changes) return NextResponse.json({ error: "AI returned an invalid or over-capacity plan" }, { status: 422 });
    return NextResponse.json({ configured: true, changes });
  } catch { return NextResponse.json({ error: "AI plan provider unavailable" }, { status: 502 }); }
}
