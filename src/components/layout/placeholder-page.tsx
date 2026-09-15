import { Badge, Card } from "@/components/ui";
import type { PageMessage } from "@/i18n/types";

export interface PlaceholderPageProps {
  page: PageMessage;
  comingSoon: string;
}

export function PlaceholderPage({ page, comingSoon }: PlaceholderPageProps) {
  return (
    <main className="page-container">
      <header className="max-w-2xl pt-3 tablet:pt-6">
        <Badge variant="accent">{comingSoon}</Badge>
        <h1 className="type-h1 mt-5 text-primary">{page.title}</h1>
        <p className="type-body mt-4 text-secondary">{page.description}</p>
      </header>

      <Card variant="muted" className="mt-10 max-w-2xl tablet:mt-14" padding="lg">
        <div className="h-2 w-16 rounded-full bg-accent-soft" aria-hidden="true" />
        <p className="type-small mt-5 text-muted">{comingSoon}</p>
      </Card>
    </main>
  );
}
