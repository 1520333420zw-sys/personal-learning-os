import { NextResponse } from "next/server";
import { parseExternalResults } from "@/data/contracts/external-providers";

export async function GET() {
  const endpoint = process.env.CURRENT_AFFAIRS_API_URL;
  if (!endpoint) return NextResponse.json({ configured: false, items: [] });
  try {
    const response = await fetch(endpoint, { headers: process.env.CURRENT_AFFAIRS_API_KEY ? { Authorization: `Bearer ${process.env.CURRENT_AFFAIRS_API_KEY}` } : {}, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    return NextResponse.json({ configured: true, items: parseExternalResults(await response.json()).filter((item) => item.publishedAt && !Number.isNaN(Date.parse(item.publishedAt))) });
  } catch { return NextResponse.json({ configured: true, error: "Current affairs provider unavailable", items: [] }, { status: 502 }); }
}
