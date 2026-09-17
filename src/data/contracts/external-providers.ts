export interface ExternalResult {
  title: string; summary: string; source: string; publishedAt?: string; url: string;
  category?: string; sourceType?: "official" | "university" | "academic" | "third-party";
}

export interface SearchProvider { search(query: string): Promise<ExternalResult[]>; }
export interface ReadingProvider { list(category?: string): Promise<ExternalResult[]>; }

export function parseExternalResults(value: unknown): ExternalResult[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as { items?: unknown }).items)) throw new Error("Invalid provider response");
  return (value as { items: unknown[] }).items.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .filter((item) => typeof item.title === "string" && typeof item.source === "string" && item.source.trim().length > 0 && typeof item.url === "string" && /^https:\/\//i.test(item.url))
    .slice(0, 30).map((item) => ({ title: String(item.title), summary: typeof item.summary === "string" ? item.summary : "",
      source: typeof item.source === "string" ? item.source : "", url: String(item.url),
      publishedAt: typeof item.publishedAt === "string" ? item.publishedAt : undefined,
      category: typeof item.category === "string" ? item.category : undefined,
      sourceType: "third-party" }));
}
