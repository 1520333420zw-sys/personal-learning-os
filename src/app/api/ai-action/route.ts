import { NextResponse } from "next/server";
import { parseLearningAction } from "@/domain/ai/actions";
import { AIProviderError, configuredAIProvider } from "@/data/providers/configured-ai";

const contractVersion = "ai-action-v2";

export async function GET() {
  return NextResponse.json({ configured: Boolean(configuredAIProvider()), contractVersion });
}

export async function POST(request: Request) {
  const provider = configuredAIProvider();
  if (!provider) return NextResponse.json({ configured: false, error: "AI provider not configured" }, { status: 503 });
  let body: { prompt?: unknown; today?: unknown; subjects?: unknown; chapters?: unknown; knowledgePoints?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (typeof body.prompt !== "string" || body.prompt.trim().length < 3 || body.prompt.length > 1000) return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
  const subjects = Array.isArray(body.subjects) ? body.subjects.slice(0, 30) : [];
  const chapters = Array.isArray(body.chapters) ? body.chapters.slice(0, 200) : [];
  const knowledgePoints = Array.isArray(body.knowledgePoints) ? body.knowledgePoints.slice(0, 300) : [];
  const today = typeof body.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.today) ? body.today : new Date().toISOString().slice(0, 10);
  const system = `You convert a user's natural-language report or request into ONE proposed Personal Learning OS action. Return exactly one JSON object with a top-level "type" field, no wrapper, prose, or markdown. Do not claim execution. Local today is ${today}; resolve "today" and "tomorrow" from this date. Use YYYY-MM-DD dates and numeric quantities, never mix counts with minutes.
Allowed object shapes:
{"type":"createStudySession","date":"YYYY-MM-DD","subjectId":"known subject ID when identified","chapterId":"known chapter ID when identified","minutes":number,"sessionType":"learning|review|practice|recitation|reading"} for reported time already spent. Use reading for book-reading time even when no specific book is named.
{"type":"recordCountedStudy","date":"YYYY-MM-DD","subjectId":"known subject ID when identified","chapterId":"known chapter ID when identified","activity":"vocabulary_recitation|question_mistakes","count":integer} for a reported number of words recited or questions answered incorrectly without their individual IDs. This records only an aggregate fact; it must not mark individual words or questions reviewed or wrong.
{"type":"createTask","title":"short concrete title","date":"YYYY-MM-DD","subjectId":"known subject ID when identified","chapterId":"known chapter ID when identified","minutes":number} for a future study or review intention.
Other supported types: createMemorizationItem {title,content or knowledgePointId,subjectId?,chapterId?}; createNote {title,content,subjectId?}; createExpense/createIncome {date,amount,category,note}; createSleepRecord {date,hours}; createExerciseRecord {date,activity,minutes}; updateBookProgress {bookId,progress}; addVocabulary {word,meaning}; scheduleReview {targetId,title,date}. For an existing knowledge point use its known ID; never invent IDs, word details, question attempts, or missing time durations. If the request cannot be represented truthfully by one allowed action, return {"type":"unsupported"}.
Known subjects: ${JSON.stringify(subjects)}. Known chapters: ${JSON.stringify(chapters)}. Known knowledge points: ${JSON.stringify(knowledgePoints)}. Match a chapter's subjectId to its subject; use only listed IDs. General Psychology / 普通心理学 is a chapter of 312 Psychology / 312 心理学.`;
  try {
    const raw = await provider.generateJson(system, body.prompt);
    const type = typeof raw === "object" && raw !== null && "type" in raw ? raw.type : undefined;
    if (type === "unsupported" || typeof type !== "string") {
      console.error("[ai-action] unsupported action", { type: typeof type === "string" ? type.slice(0, 60) : null });
      return NextResponse.json({ error: "AI returned an unsupported action", code: "unsupported_action" }, { status: 422 });
    }
    const action = parseLearningAction(raw);
    if (!action) {
      console.error("[ai-action] action schema validation failed", { type: type.slice(0, 60) });
      return NextResponse.json({ error: "AI action failed schema validation", code: "schema_validation_failed" }, { status: 422 });
    }
    if ("subjectId" in action && action.subjectId && !subjects.some((item) => item?.id === action.subjectId) ||
      "chapterId" in action && action.chapterId && !chapters.some((item) => item?.id === action.chapterId && (!action.subjectId || item.subjectId === action.subjectId))) {
      console.error("[ai-action] action reference validation failed", { type });
      return NextResponse.json({ error: "AI action used an unknown subject or chapter", code: "invalid_reference" }, { status: 422 });
    }
    return NextResponse.json({ configured: true, action, contractVersion });
  } catch (error) {
    if (error instanceof AIProviderError) {
      console.error("[ai-action] provider failure", { kind: error.kind, ...error.details });
      return NextResponse.json({ configured: true, error: "AI provider request failed", code: `provider_${error.kind}`, upstreamStatus: error.details.status, providerCode: error.details.providerCode, parameter: error.details.parameter }, { status: 502 });
    }
    console.error("[ai-action] unexpected failure", { name: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ configured: true, error: "Unexpected AI action failure", code: "unexpected_error" }, { status: 500 });
  }
}
