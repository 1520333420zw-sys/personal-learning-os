"use client";

import type { ReactNode } from "react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";

export const fieldClass = "min-h-11 w-full rounded-md border border-border-strong bg-surface px-3.5 text-base text-primary shadow-soft placeholder:text-muted focus:border-accent disabled:bg-surface-muted";
export const areaClass = `${fieldClass} min-h-28 resize-y py-3`;

export function BetaPage({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <main className="page-container overflow-hidden">
      <div className="section-stack">
        <header className="flex flex-col gap-5 tablet:flex-row tablet:items-end tablet:justify-between">
          <div className="max-w-3xl"><h1 className="type-h1 text-primary">{title}</h1>{description ? <p className="type-body mt-3 text-secondary">{description}</p> : null}</div>
          {action}
        </header>
        {children}
      </div>
    </main>
  );
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <Card variant="muted" className="text-center"><p className="type-body text-secondary">{children}</p>{action ? <div className="mt-4">{action}</div> : null}</Card>;
}

export function Modal({ title, closeLabel, onClose, children }: { title: string; closeLabel: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-0 tablet:items-center tablet:p-6" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="beta-dialog-title" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl border border-border bg-surface-raised p-5 shadow-card tablet:max-w-2xl tablet:rounded-xl tablet:p-7">
        <div className="mb-6 flex items-start justify-between gap-4"><h2 id="beta-dialog-title" className="type-h2 text-primary">{title}</h2><Button variant="ghost" size="sm" onClick={onClose} aria-label={closeLabel}>×</Button></div>
        {children}
      </section>
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <label className={cn("grid gap-2 type-label text-primary", className)}>{label}{children}</label>;
}

export function Tabs({ items, value, onChange, label }: { items: { id: string; label: string }[]; value: string; onChange: (id: string) => void; label: string }) {
  return <div role="tablist" aria-label={label} className="flex max-w-full gap-2 overflow-x-auto pb-1">{items.map((item) => <button key={item.id} type="button" role="tab" aria-selected={value === item.id} onClick={() => onChange(item.id)} className={cn("min-h-11 shrink-0 rounded-md border px-4 type-small transition-colors", value === item.id ? "border-accent bg-accent-soft text-primary" : "border-border bg-surface text-secondary hover:border-border-strong")}>{item.label}</button>)}</div>;
}

export function nowEntity(id: string, ownerId: string) { const now = new Date().toISOString(); return { id, ownerId, createdAt: now, updatedAt: now }; }
export function uid(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }
export function localDate(date = new Date()) { const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); }
export function formatDateTime(value: string, locale: string) { return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
