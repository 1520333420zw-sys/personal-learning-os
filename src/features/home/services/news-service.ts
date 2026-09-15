import type { NewsRepository } from "@/data";
import type { HomeMessages } from "@/i18n";
import type { Locale } from "@/i18n/config";

import type { HomeNewsViewModel } from "../types";

export class NewsService {
  constructor(
    private readonly repository: NewsRepository,
    private readonly locale: Locale,
    private readonly messages: HomeMessages,
  ) {}

  async getHomeSummary(limit = 3): Promise<readonly HomeNewsViewModel[]> {
    const items = await this.repository.listLatest(limit);

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      categoryLabel: this.messages.news.categories[item.category],
      source: item.source,
      publishedAtLabel: new Intl.DateTimeFormat(this.locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(item.publishedAt)),
      url: item.url,
      isDemo: item.isDemo,
    }));
  }
}
