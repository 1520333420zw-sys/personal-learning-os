import { NextResponse } from "next/server";
import { authorized } from "@/data/server/external-write-store";
import { learningMirrorEnvironment, learningReadConfigured } from "@/data/server/learning-mirror-store";

export const ownerId = "local-owner";
export const noStoreHeaders = { "Cache-Control": "private, no-store" };
export const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: noStoreHeaders });
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validDate(value: string | null): value is string {
  if (!value || !datePattern.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validRange(from: string, to: string): boolean {
  if (from > to) return false;
  return (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000 <= 366;
}

export async function authorizeLearningRead(request: Request) {
  const env = await learningMirrorEnvironment();
  if (!learningReadConfigured(env)) return { response: json({ error: "learning_read_not_configured" }, 503) };
  if (!await authorized(request.headers.get("authorization"), env.EXTERNAL_READ_TOKEN)) return { response: json({ error: "unauthorized" }, 401) };
  return { env };
}
