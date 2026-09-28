import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { BetaDataProvider } from "@/providers";
import { AiAssistant } from "@/features/beta/ai-assistant";
import { ExternalWriteAutoSync } from "@/features/beta/external-write-auto-sync";

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
    <BetaDataProvider>
      <ExternalWriteAutoSync />
      <AppShell locale={locale} dictionary={getDictionary(locale)}>
        {children}
        <AiAssistant locale={locale} />
      </AppShell>
    </BetaDataProvider>
  );
}
