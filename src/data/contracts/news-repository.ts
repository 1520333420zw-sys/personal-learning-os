import type { NewsItem } from "@/domain";

export interface NewsRepository {
  listLatest(limit: number): Promise<readonly NewsItem[]>;
}
