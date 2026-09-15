import type { NewsItem } from "@/domain";
import type { Locale } from "@/i18n/config";

function hoursAgo(referenceDate: Date, hours: number): string {
  return new Date(referenceDate.getTime() - hours * 60 * 60 * 1000).toISOString();
}

export function createNewsFixtures(
  locale: Locale,
  referenceDate = new Date(),
): readonly NewsItem[] {
  const localized = locale === "zh-CN"
    ? [
        {
          title: "城市公共图书馆试行延长夜间开放时间",
          summary: "这是一条用于验证首页新闻摘要布局的示例内容，并非实时新闻。",
          category: "society" as const,
        },
        {
          title: "高校团队展示低能耗计算研究样机",
          summary: "示例摘要用于验证科技分类、来源与发布时间的展示方式。",
          category: "technology" as const,
        },
        {
          title: "区域学习交流活动发布示例议程",
          summary: "此条目仅用于产品开发阶段，不代表真实事件或新闻报道。",
          category: "world" as const,
        },
      ]
    : [
        {
          title: "City library pilots extended evening hours",
          summary: "Demo content for validating the Home news-summary layout. This is not live news.",
          category: "society" as const,
        },
        {
          title: "University team presents low-energy computing prototype",
          summary: "A sample summary used to verify category, source, and publication metadata.",
          category: "technology" as const,
        },
        {
          title: "Regional learning exchange publishes sample agenda",
          summary: "This item exists only for product development and does not describe a real report.",
          category: "world" as const,
        },
      ];

  return localized.map((item, index) => ({
    id: `news-demo-${index + 1}`,
    ...item,
    source: locale === "zh-CN"
      ? "Personal Learning OS · 示例数据"
      : "Personal Learning OS · Demo",
    publishedAt: hoursAgo(referenceDate, index + 2),
    isDemo: true,
  }));
}
