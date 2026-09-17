import { NextResponse } from "next/server";
import { parseExternalResults } from "@/data/contracts/external-providers";

export async function GET(request: Request) {
  const endpoint = process.env.RESOURCE_SEARCH_API_URL;
  if (!endpoint) return NextResponse.json({ configured: false, items: [] });
  if (new URL(request.url).searchParams.get("status") === "1") return NextResponse.json({ configured: true, items: [] });
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 120) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  try {
    const url = new URL(endpoint); url.searchParams.set("q", query);
    const response = await fetch(url, { headers: process.env.RESOURCE_SEARCH_API_KEY ? { Authorization: `Bearer ${process.env.RESOURCE_SEARCH_API_KEY}` } : {}, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const items = parseExternalResults(await response.json());
    return NextResponse.json({ configured: true, items });
  } catch { return NextResponse.json({ configured: true, error: "Search provider unavailable", items: [] }, { status: 502 }); }
}
