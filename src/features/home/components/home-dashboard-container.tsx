"use client";

import { useEffect, useMemo, useState } from "react";

import { createNewsRepository } from "@/data";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { useLearningData } from "@/providers";

import { HomeDashboardService } from "../services";
import type { HomeDashboardData } from "../types";
import { HomeDashboard } from "./home-dashboard";

interface HomeDashboardContainerProps {
  initialData: HomeDashboardData;
  dictionary: Dictionary;
  locale: Locale;
}

export function HomeDashboardContainer({
  initialData,
  dictionary,
  locale,
}: HomeDashboardContainerProps) {
  const { context, revision } = useLearningData();
  const [data, setData] = useState(initialData);
  const service = useMemo(
    () =>
      new HomeDashboardService(
        context,
        locale,
        dictionary,
        createNewsRepository(locale),
      ),
    [context, dictionary, locale],
  );

  useEffect(() => {
    let active = true;
    void service.getDashboard().then((nextData) => {
      if (active) setData(nextData);
    });
    return () => {
      active = false;
    };
  }, [revision, service]);

  return <HomeDashboard data={data} dictionary={dictionary} locale={locale} />;
}
