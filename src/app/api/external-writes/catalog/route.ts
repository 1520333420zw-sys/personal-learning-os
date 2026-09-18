import { NextResponse } from "next/server";
import { createInitialBetaState } from "@/data/browser/beta-store";
import { authorized, configured, externalWriteEnvironment } from "@/data/server/external-write-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const env = await externalWriteEnvironment();
  const headers = { "Cache-Control": "no-store" };
  if (!configured(env)) return NextResponse.json({ error: "external_write_not_configured" }, { status: 503, headers });
  if (!await authorized(request.headers.get("authorization"), env.EXTERNAL_WRITE_TOKEN)) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  const state = createInitialBetaState();
  return NextResponse.json({ subjects: state.subjects.map(({ id, name, nameEn }) => ({ id, name, nameEn })),
    chapters: state.chapters.map(({ id, subjectId, title, titleEn }) => ({ id, subjectId, title, titleEn })),
    questions: state.questions.map(({ id, subjectId, chapterId, stem }) => ({ id, subjectId, chapterId, stem })) }, { headers });
}
