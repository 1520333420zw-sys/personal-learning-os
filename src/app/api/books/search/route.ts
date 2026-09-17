import { NextRequest, NextResponse } from "next/server";
import { openLibraryBooks } from "@/data/providers/open-library-books";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 120) return NextResponse.json({ error: "Query must be 2–120 characters." }, { status: 400 });
  try {
    return NextResponse.json({ provider: "Open Library", items: await openLibraryBooks.search(query) });
  } catch {
    return NextResponse.json({ error: "Book search is temporarily unavailable." }, { status: 502 });
  }
}
