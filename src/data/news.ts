import type { NewsRepository } from "./contracts";
import { MockNewsRepository } from "./mock";
import type { Locale } from "@/i18n/config";
import { createNewsFixtures } from "@/mocks/fixtures";

export function createNewsRepository(
  locale: Locale,
  referenceDate = new Date(),
): NewsRepository {
  void locale;
  void referenceDate;
  return new MockNewsRepository(createNewsFixtures());
}
