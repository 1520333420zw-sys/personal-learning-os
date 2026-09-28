import { NextResponse } from "next/server";
import { parseLearningMirrorSync } from "@/domain/learning-mirror";
import { applyLearningMirrorSync, learningMirrorEnvironment, mirrorConfigured } from "@/data/server/learning-mirror-store";
import { syncAuthorized } from "@/data/server/external-write-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ownerId = "local-owner";
const headers = { "Cache-Control": "no-store" };
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers });

export async function POST(request: Request) {
  const env = await learningMirrorEnvironment();
  if (!mirrorConfigured(env) || !env.EXTERNAL_SYNC_TOKEN) return json({ error: "learning_mirror_not_configured" }, 503);
  if (!await syncAuthorized(request, env.EXTERNAL_SYNC_TOKEN)) return json({ error: "unauthorized" }, 401);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "json_required" }, 415);
  if (Number(request.headers.get("content-length")) > 500_000) return json({ error: "payload_too_large" }, 413);
  let value: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 500_000) return json({ error: "payload_too_large" }, 413);
    value = JSON.parse(raw);
  } catch { return json({ error: "invalid_json" }, 400); }
  const payload = parseLearningMirrorSync(value);
  if (!payload) return json({ error: "invalid_learning_mirror_payload" }, 422);
  try { return json(await applyLearningMirrorSync(env.EXTERNAL_INBOX_DB!, ownerId, payload)); }
  catch (error) { console.error("learning_mirror_sync_failed", error); return json({ error: "storage_error" }, 503); }
}
