import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <AppShell locale={locale} dictionary={getDictionary(locale)}>
      {children}
    </AppShell>
  );
}
