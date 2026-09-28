import { getLearningSummary } from "@/data/server/learning-mirror-store";
import { authorizeLearningRead, json, ownerId, validDate, validRange } from "../shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeLearningRead(request);
  if (auth.response) return auth.response;
  const url = new URL(request.url);
  const from = url.searchParams.get("from"); const to = url.searchParams.get("to");
  const subjectId = url.searchParams.get("subjectId") || undefined;
  if (!validDate(from) || !validDate(to) || !validRange(from, to) || (subjectId && subjectId.length > 160)) return json({ error: "invalid_query" }, 400);
  try { return json(await getLearningSummary(auth.env.EXTERNAL_INBOX_DB!, ownerId, from, to, subjectId)); }
  catch (error) { console.error("learning_summary_failed", error); return json({ error: "storage_error" }, 503); }
}
