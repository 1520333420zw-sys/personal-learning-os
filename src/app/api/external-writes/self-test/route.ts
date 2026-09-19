import { NextResponse } from "next/server";
import { createInitialBetaState, migrateBetaState } from "@/data/browser/beta-store";
import { applyExternalWrite, revertExternalWrite } from "@/data/browser/external-write-merge";
import { authorized, changeExternalWriteStatus, configured, createExternalWrite, externalWriteEnvironment, listExternalWrites } from "@/data/server/external-write-store";
import { parseExternalWrite } from "@/domain/external-writes/command";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const challenge = "e2e-4caebd15-08c2-4de7-9ed8-2e4c2fcaa2dc";

export async function POST(request: Request) {
  if (request.headers.get("x-e2e-challenge") !== challenge) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const env = await externalWriteEnvironment();
  if (!configured(env)) return NextResponse.json({ configured: false }, { status: 503 });
  const key = `e2e-${crypto.randomUUID()}`;
  let receiptId = "";
  const checks: Record<string, boolean> = {};
  try {
    checks.rejectsInvalidAuth = !await authorized("Bearer invalid-e2e-token", env.EXTERNAL_WRITE_TOKEN);
    checks.writeAuth = await authorized(`Bearer ${env.EXTERNAL_WRITE_TOKEN}`, env.EXTERNAL_WRITE_TOKEN);
    checks.syncAuth = await authorized(`Bearer ${env.EXTERNAL_SYNC_TOKEN}`, env.EXTERNAL_SYNC_TOKEN);
    const command = parseExternalWrite({ type: "task", title: "External write end-to-end test", date: "2099-12-31", plannedMinutes: 5, priority: "low" });
    checks.schema = command?.type === "task";
    if (!command || command.type !== "task") throw new Error("E2E_SCHEMA_FAILED");
    const created = await createExternalWrite(env.EXTERNAL_INBOX_DB!, "local-owner", key, command);
    receiptId = created.receipt.id;
    checks.created = !created.duplicate && !created.conflict;
    const duplicate = await createExternalWrite(env.EXTERNAL_INBOX_DB!, "local-owner", key, command);
    checks.idempotent = duplicate.duplicate && !duplicate.conflict && duplicate.receipt.id === receiptId;
    const conflicting = await createExternalWrite(env.EXTERNAL_INBOX_DB!, "local-owner", key, { ...command, plannedMinutes: 10 });
    checks.conflict = conflicting.conflict;
    const inbox = await listExternalWrites(env.EXTERNAL_INBOX_DB!, "local-owner", 0);
    checks.inbox = inbox.items.some((item) => item.id === receiptId && item.status === "pending");
    const browserState = migrateBetaState(JSON.parse(JSON.stringify(createInitialBetaState())));
    checks.browserImport = applyExternalWrite(browserState, created.receipt).length === 1 && browserState.tasks.some((item) => item.id === `external-${receiptId}`);
    checks.browserDedupe = applyExternalWrite(browserState, created.receipt).length === 0;
    checks.browserUndo = revertExternalWrite(browserState, receiptId) && !browserState.tasks.some((item) => item.id === `external-${receiptId}`);
    checks.applied = (await changeExternalWriteStatus(env.EXTERNAL_INBOX_DB!, "local-owner", receiptId, "pending", "applied"))?.status === "applied";
    checks.revokeRequested = (await changeExternalWriteStatus(env.EXTERNAL_INBOX_DB!, "local-owner", receiptId, "applied", "revoke_requested"))?.status === "revoke_requested";
    checks.reverted = (await changeExternalWriteStatus(env.EXTERNAL_INBOX_DB!, "local-owner", receiptId, "revoke_requested", "reverted"))?.status === "reverted";
    await env.EXTERNAL_INBOX_DB!.prepare("DELETE FROM external_writes WHERE owner_id = ? AND idempotency_key = ?").bind("local-owner", key).run();
    const remaining = await env.EXTERNAL_INBOX_DB!.prepare("SELECT COUNT(*) AS count FROM external_writes WHERE owner_id = ? AND idempotency_key = ?").bind("local-owner", key).first<{ count: number }>();
    checks.cleaned = remaining?.count === 0;
    return NextResponse.json({ configured: true, passed: Object.values(checks).every(Boolean), checks });
  } catch (error) {
    console.error("external_write_e2e_failed", error);
    return NextResponse.json({ configured: true, passed: false, checks }, { status: 500 });
  } finally {
    try { await env.EXTERNAL_INBOX_DB!.prepare("DELETE FROM external_writes WHERE owner_id = ? AND idempotency_key = ?").bind("local-owner", key).run(); }
    catch (error) { console.error("external_write_e2e_cleanup_failed", { receiptId, error }); }
  }
}
