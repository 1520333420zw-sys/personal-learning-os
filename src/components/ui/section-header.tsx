import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface SectionHeaderProps {
  titleId?: string;
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  titleId,
  title,
  description,
  eyebrow,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="type-label mb-2 uppercase tracking-[0.12em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 id={titleId} className="type-h2 text-primary">
          {title}
        </h2>
        {description ? (
          <p className="type-body mt-2 text-secondary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
