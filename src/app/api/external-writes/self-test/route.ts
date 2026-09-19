import { NextResponse } from "next/server";
import { configured, externalWriteEnvironment } from "@/data/server/external-write-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const challenge = "e2e-4caebd15-08c2-4de7-9ed8-2e4c2fcaa2dc";

export async function POST(request: Request) {
  if (request.headers.get("x-e2e-challenge") !== challenge) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const env = await externalWriteEnvironment();
  if (!configured(env)) return NextResponse.json({ configured: false }, { status: 503 });
  const key = `e2e-${crypto.randomUUID()}`;
  const origin = new URL(request.url).origin;
  const writeHeaders = { Authorization: `Bearer ${env.EXTERNAL_WRITE_TOKEN}`, "Content-Type": "application/json", "Idempotency-Key": key };
  const syncHeaders = { Authorization: `Bearer ${env.EXTERNAL_SYNC_TOKEN}`, "Content-Type": "application/json" };
  let receiptId = "";
  const checks: Record<string, boolean> = {};
  try {
    checks.rejectsInvalidAuth = (await fetch(`${origin}/api/external-writes/catalog`, { headers: { Authorization: "Bearer invalid-e2e-token" } })).status === 401;
    checks.catalog = (await fetch(`${origin}/api/external-writes/catalog`, { headers: { Authorization: `Bearer ${env.EXTERNAL_WRITE_TOKEN}` } })).status === 200;
    const command = { type: "task", title: "External write end-to-end test", date: "2099-12-31", plannedMinutes: 5, priority: "low" };
    const created = await fetch(`${origin}/api/external-writes`, { method: "POST", headers: writeHeaders, body: JSON.stringify(command) });
    const createdBody = await created.json() as { id?: string };
    receiptId = createdBody.id ?? "";
    checks.created = created.status === 201 && Boolean(receiptId);
    const duplicate = await fetch(`${origin}/api/external-writes`, { method: "POST", headers: writeHeaders, body: JSON.stringify(command) });
    const duplicateBody = await duplicate.json() as { id?: string; duplicate?: boolean };
    checks.idempotent = duplicate.status === 200 && duplicateBody.duplicate === true && duplicateBody.id === receiptId;
    const conflict = await fetch(`${origin}/api/external-writes`, { method: "POST", headers: writeHeaders, body: JSON.stringify({ ...command, plannedMinutes: 10 }) });
    checks.conflict = conflict.status === 409;
    const inbox = await fetch(`${origin}/api/external-writes?after=0`, { headers: { Authorization: `Bearer ${env.EXTERNAL_SYNC_TOKEN}` } });
    const inboxBody = await inbox.json() as { items?: { id: string; status: string }[] };
    checks.inbox = inbox.status === 200 && Boolean(inboxBody.items?.some((item) => item.id === receiptId && item.status === "pending"));
    const applied = await fetch(`${origin}/api/external-writes/${receiptId}`, { method: "PATCH", headers: syncHeaders, body: JSON.stringify({ action: "applied" }) });
    checks.applied = applied.status === 200 && (await applied.json() as { status?: string }).status === "applied";
    const revoke = await fetch(`${origin}/api/external-writes/${receiptId}`, { method: "DELETE", headers: { Authorization: `Bearer ${env.EXTERNAL_WRITE_TOKEN}` } });
    checks.revokeRequested = revoke.status === 200 && (await revoke.json() as { status?: string }).status === "revoke_requested";
    const reverted = await fetch(`${origin}/api/external-writes/${receiptId}`, { method: "PATCH", headers: syncHeaders, body: JSON.stringify({ action: "reverted" }) });
    checks.reverted = reverted.status === 200 && (await reverted.json() as { status?: string }).status === "reverted";
    return NextResponse.json({ configured: true, passed: Object.values(checks).every(Boolean), checks });
  } catch (error) {
    console.error("external_write_e2e_failed", error);
    return NextResponse.json({ configured: true, passed: false, checks }, { status: 500 });
  } finally {
    try { await env.EXTERNAL_INBOX_DB!.prepare("DELETE FROM external_writes WHERE owner_id = ? AND idempotency_key = ?").bind("local-owner", key).run(); }
    catch (error) { console.error("external_write_e2e_cleanup_failed", { receiptId, error }); }
  }
}
