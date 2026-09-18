import { NextResponse } from "next/server";
import { parseExternalWrite } from "@/domain/external-writes/command";
import { authorized, configured, createExternalWrite, externalWriteEnvironment, listExternalWrites } from "@/data/server/external-write-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ownerId = "local-owner";
const headers = { "Cache-Control": "no-store" };
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers });

export async function POST(request: Request) {
  const env = await externalWriteEnvironment();
  if (!configured(env)) return json({ error: "external_write_not_configured" }, 503);
  if (!await authorized(request.headers.get("authorization"), env.EXTERNAL_WRITE_TOKEN)) return json({ error: "unauthorized" }, 401);
  const key = request.headers.get("idempotency-key");
  if (!key || !/^[A-Za-z0-9_-]{16,128}$/.test(key)) return json({ error: "invalid_idempotency_key" }, 400);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "json_required" }, 415);
  if (Number(request.headers.get("content-length")) > 12_000) return json({ error: "payload_too_large" }, 413);
  let value: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 12_000) return json({ error: "payload_too_large" }, 413);
    value = JSON.parse(raw);
  } catch { return json({ error: "invalid_json" }, 400); }
  const command = parseExternalWrite(value);
  if (!command) return json({ error: "invalid_command", detail: "Use one supported type with valid fields, dates and ranges." }, 422);
  try {
    const result = await createExternalWrite(env.EXTERNAL_INBOX_DB!, ownerId, key, command);
    if (result.conflict) return json({ error: "idempotency_conflict" }, 409);
    return json({ ...result.receipt, duplicate: result.duplicate }, result.duplicate ? 200 : 201);
  } catch (error) {
    console.error("external_write_insert_failed", error);
    return json({ error: "storage_error" }, 503);
  }
}

export async function GET(request: Request) {
  const env = await externalWriteEnvironment();
  if (!configured(env)) return json({ error: "external_write_not_configured" }, 503);
  if (!await authorized(request.headers.get("authorization"), env.EXTERNAL_SYNC_TOKEN)) return json({ error: "unauthorized" }, 401);
  const raw = new URL(request.url).searchParams.get("after") ?? "0";
  const after = Number(raw);
  if (!Number.isSafeInteger(after) || after < 0) return json({ error: "invalid_cursor" }, 400);
  try { return json(await listExternalWrites(env.EXTERNAL_INBOX_DB!, ownerId, after)); }
  catch (error) { console.error("external_write_list_failed", error); return json({ error: "storage_error" }, 503); }
}
