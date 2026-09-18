import { NextResponse } from "next/server";
import { authorized, changeExternalWriteStatus, configured, externalWriteEnvironment } from "@/data/server/external-write-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ownerId = "local-owner";
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const env = await externalWriteEnvironment();
  if (!configured(env)) return json({ error: "external_write_not_configured" }, 503);
  if (!await authorized(request.headers.get("authorization"), env.EXTERNAL_SYNC_TOKEN)) return json({ error: "unauthorized" }, 401);
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "invalid_id" }, 400);
  let action: unknown;
  try { action = (await request.json() as { action?: unknown }).action; }
  catch { return json({ error: "invalid_json" }, 400); }
  const transition = action === "applied" ? ["pending", "applied"] : action === "reverted" ? ["revoke_requested", "reverted"] : action === "undo" ? ["applied", "reverted"] : action === "reject" ? ["pending", "cancelled"] : null;
  if (!transition) return json({ error: "invalid_action" }, 422);
  try {
    const item = await changeExternalWriteStatus(env.EXTERNAL_INBOX_DB!, ownerId, id, transition[0], transition[1]);
    if (!item) return json({ error: "not_found" }, 404);
    if (item.status !== transition[1]) return json({ error: "status_conflict", status: item.status }, 409);
    return json(item);
  } catch (error) { console.error("external_write_status_failed", error); return json({ error: "storage_error" }, 503); }
}

export async function DELETE(request: Request, context: Context) {
  const env = await externalWriteEnvironment();
  if (!configured(env)) return json({ error: "external_write_not_configured" }, 503);
  if (!await authorized(request.headers.get("authorization"), env.EXTERNAL_WRITE_TOKEN)) return json({ error: "unauthorized" }, 401);
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "invalid_id" }, 400);
  try {
    let item = await changeExternalWriteStatus(env.EXTERNAL_INBOX_DB!, ownerId, id, "pending", "cancelled");
    if (item?.status === "applied") item = await changeExternalWriteStatus(env.EXTERNAL_INBOX_DB!, ownerId, id, "applied", "revoke_requested");
    if (!item) return json({ error: "not_found" }, 404);
    return json(item);
  } catch (error) { console.error("external_write_revoke_failed", error); return json({ error: "storage_error" }, 503); }
}
