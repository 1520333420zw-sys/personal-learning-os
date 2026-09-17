"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, SectionHeader } from "@/components/ui";
import type { Locale } from "@/i18n/config";

export function AiPlanStatus({ locale }: { locale: Locale }) {
  const [configured, setConfigured] = useState(false);
  useEffect(() => { void fetch("/api/ai-plan").then((response) => response.json()).then((value: { configured?: boolean }) => setConfigured(Boolean(value.configured))).catch(() => setConfigured(false)); }, []);
  const en = locale === "en";
  return <section><SectionHeader title={en ? "AI plan" : "AI 今日计划建议"} /><Card className="mt-5" padding="sm"><p className="type-small text-secondary">{configured
    ? (en ? "Generate a plan based on your saved capacity, shifts and current tasks. Every change needs confirmation." : "可根据已保存的时间、排班和现有任务生成计划；每项变更都需确认。")
    : (en ? "AI service is not configured. Your manual plan remains available." : "AI 服务尚未配置。你仍可手动安排学习计划。")}</p><Link className="type-label mt-3 inline-flex min-h-11 items-center text-accent hover:underline" href={`/${locale}/plan`}>{en ? "Open Study Plan →" : "进入学习计划 →"}</Link></Card></section>;
}
