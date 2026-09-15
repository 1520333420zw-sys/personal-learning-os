import { en } from "./dictionaries/en";
import { zhCN } from "./dictionaries/zh-CN";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = {
  "zh-CN": zhCN,
  en,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary, HomeMessages, PageKey } from "./types";
