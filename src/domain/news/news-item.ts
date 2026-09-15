import type { EntityId, ISODateTimeString } from "@/domain/common/entity";

export type NewsCategory =
  | "china"
  | "world"
  | "economy"
  | "technology"
  | "politics"
  | "society";

export interface NewsItem {
  id: EntityId;
  title: string;
  summary: string;
  category: NewsCategory;
  source: string;
  publishedAt: ISODateTimeString;
  url?: string;
  isDemo: boolean;
}
