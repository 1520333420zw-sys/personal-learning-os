import type { NewsRepository } from "@/data/contracts";
import type { NewsItem } from "@/domain";

export class MockNewsRepository implements NewsRepository {
  constructor(private readonly items: readonly NewsItem[]) {}

  async listLatest(limit: number): Promise<readonly NewsItem[]> {
    return structuredClone(
      [...this.items]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, Math.max(0, limit)),
    );
  }
}
