import { NextResponse } from "next/server";
import { parseExternalResults } from "@/data/contracts/external-providers";

export async function GET(request: Request) {
  const endpoint = process.env.READING_FEED_API_URL;
  if (!endpoint) return NextResponse.json({ configured: false, items: [] });
  const category = new URL(request.url).searchParams.get("category") ?? "";
  try {
    const url = new URL(endpoint); if (category) url.searchParams.set("category", category);
    const response = await fetch(url, { headers: process.env.READING_FEED_API_KEY ? { Authorization: `Bearer ${process.env.READING_FEED_API_KEY}` } : {}, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    return NextResponse.json({ configured: true, items: parseExternalResults(await response.json()).filter((item) => item.publishedAt && !Number.isNaN(Date.parse(item.publishedAt))) });
  } catch { return NextResponse.json({ configured: true, error: "Reading provider unavailable", items: [] }, { status: 502 }); }
}
