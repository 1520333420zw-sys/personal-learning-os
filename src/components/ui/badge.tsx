import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "warm"
  | "apricot"
  | "rose";
type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-surface-muted text-secondary",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  warm: "bg-warm-oat-soft text-primary",
  apricot: "bg-muted-apricot-soft text-primary",
  rose: "bg-dusty-rose-soft text-primary",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "min-h-6 px-2 text-xs",
  md: "min-h-7 px-2.5 text-sm",
};

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
