import { NextResponse } from "next/server";
import { parseLearningAction } from "@/domain/ai/actions";

export async function GET() {
  return NextResponse.json({ configured: Boolean(process.env.AI_API_URL && process.env.AI_API_KEY && process.env.AI_MODEL) });
}

export async function POST(request: Request) {
  const endpoint = process.env.AI_API_URL; const key = process.env.AI_API_KEY; const model = process.env.AI_MODEL;
  if (!endpoint || !key || !model) return NextResponse.json({ configured: false, error: "AI provider not configured" }, { status: 503 });
  let body: { prompt?: unknown; today?: unknown; subjects?: unknown; chapters?: unknown; knowledgePoints?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (typeof body.prompt !== "string" || body.prompt.trim().length < 3 || body.prompt.length > 1000) return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
  const subjects = Array.isArray(body.subjects) ? body.subjects.slice(0, 30) : [];
  const chapters = Array.isArray(body.chapters) ? body.chapters.slice(0, 200) : [];
  const knowledgePoints = Array.isArray(body.knowledgePoints) ? body.knowledgePoints.slice(0, 300) : [];
  const today = typeof body.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.today) ? body.today : new Date().toISOString().slice(0, 10);
  const system = `Return exactly one JSON object for a proposed Personal Learning OS action. Allowed types: createTask, createStudySession, createMemorizationItem, createNote, createExpense, createIncome, createSleepRecord, createExerciseRecord, updateBookProgress, addVocabulary, scheduleReview. Use YYYY-MM-DD local dates. For unknown or ambiguous data return {"type":"unsupported"}. Do not claim execution. User's local today: ${today}. Known subjects: ${JSON.stringify(subjects)}. Known chapters: ${JSON.stringify(chapters)}. Known knowledge points: ${JSON.stringify(knowledgePoints)}. For an existing knowledge point, use its ID as knowledgePointId in createMemorizationItem; do not invent content. Use only matching IDs. Study duration uses minutes, sleep uses hours.`;
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, temperature: 0, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: body.prompt }] }),
      cache: "no-store", signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const result: unknown = await response.json();
    const content = (result as { choices?: { message?: { content?: unknown } }[] }).choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Missing action");
    const action = parseLearningAction(JSON.parse(content));
    if (!action) return NextResponse.json({ error: "No safe action could be parsed" }, { status: 422 });
    return NextResponse.json({ configured: true, action });
  } catch { return NextResponse.json({ configured: true, error: "AI provider unavailable or returned an invalid action" }, { status: 502 }); }
}
