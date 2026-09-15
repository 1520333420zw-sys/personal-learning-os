import type { NewsRepository } from "./contracts";
import { MockNewsRepository } from "./mock";
import type { Locale } from "@/i18n/config";
import { createNewsFixtures } from "@/mocks/fixtures";

export function createNewsRepository(
  locale: Locale,
  referenceDate = new Date(),
): NewsRepository {
  return new MockNewsRepository(createNewsFixtures(locale, referenceDate));
}
