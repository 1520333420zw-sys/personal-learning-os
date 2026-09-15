import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type CardVariant = "default" | "muted" | "elevated";
type CardPadding = "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const variantClasses: Record<CardVariant, string> = {
  default: "border-border bg-surface shadow-soft",
  muted: "border-transparent bg-surface-muted",
  elevated: "border-border bg-surface-raised shadow-card",
};

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-5 tablet:p-6",
  lg: "p-6 tablet:p-8",
};

export function Card({
  className,
  variant = "default",
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      )}
      {...props}
    />
  );
}
