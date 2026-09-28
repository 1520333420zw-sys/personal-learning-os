import { listRecentMirroredSessions } from "@/data/server/learning-mirror-store";
import { authorizeLearningRead, json, ownerId } from "../shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeLearningRead(request);
  if (auth.response) return auth.response;
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "20");
  const subjectId = url.searchParams.get("subjectId") || undefined;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || (subjectId && subjectId.length > 160)) return json({ error: "invalid_query" }, 400);
  try { return json({ sessions: await listRecentMirroredSessions(auth.env.EXTERNAL_INBOX_DB!, ownerId, limit, subjectId) }); }
  catch (error) { console.error("recent_learning_sessions_failed", error); return json({ error: "storage_error" }, 503); }
}
