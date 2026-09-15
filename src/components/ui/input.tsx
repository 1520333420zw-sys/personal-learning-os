"use client";

import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({
  className,
  label,
  hint,
  error,
  id,
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = inputId + "-description";

  return (
    <div className="grid gap-2">
      {label ? (
        <label className="type-label text-primary" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? descriptionId : undefined}
        className={cn(
          "min-h-11 w-full rounded-md border border-border-strong bg-surface px-3.5 py-2.5 text-base text-primary shadow-soft outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-normal)] ease-[var(--ease-natural)] placeholder:text-muted hover:border-accent disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
          error && "border-error focus-visible:outline-error",
          className,
        )}
        {...props}
      />
      {hint || error ? (
        <p
          id={descriptionId}
          className={cn("type-caption text-muted", error && "text-error")}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
