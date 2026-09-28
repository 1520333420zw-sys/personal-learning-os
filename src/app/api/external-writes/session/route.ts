import { NextResponse } from "next/server";
import {
  authorized,
  configured,
  createSyncSession,
  externalWriteEnvironment,
  syncSessionCookie,
} from "@/data/server/external-write-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const env = await externalWriteEnvironment();
  if (!configured(env)) return NextResponse.json({ error: "external_write_not_configured" }, { status: 503, headers });
  if (!await authorized(request.headers.get("authorization"), env.EXTERNAL_SYNC_TOKEN)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }
  const session = await createSyncSession(env.EXTERNAL_SYNC_TOKEN!);
  return NextResponse.json({ connected: true }, { headers: { ...headers, "Set-Cookie": syncSessionCookie(session) } });
}

export async function DELETE() {
  return NextResponse.json({ connected: false }, { headers: { ...headers, "Set-Cookie": syncSessionCookie("", 0) } });
}
