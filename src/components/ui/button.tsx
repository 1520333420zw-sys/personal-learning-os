import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-accent bg-accent text-white shadow-soft hover:border-accent-hover hover:bg-accent-hover",
  secondary:
    "border-border-strong bg-surface text-primary shadow-soft hover:bg-surface-muted",
  ghost: "border-transparent bg-transparent text-secondary hover:bg-accent-soft hover:text-primary",
  danger:
    "border-error bg-error text-white shadow-soft hover:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3.5 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--duration-normal)] ease-[var(--ease-natural)] active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
