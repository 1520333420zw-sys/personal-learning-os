"use client";

import { useId, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({
  className,
  label,
  hint,
  error,
  id,
  disabled,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const descriptionId = textareaId + "-description";

  return (
    <div className="grid gap-2">
      {label ? (
        <label className="type-label text-primary" htmlFor={textareaId}>
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? descriptionId : undefined}
        className={cn(
          "min-h-28 w-full resize-y rounded-md border border-border-strong bg-surface px-3.5 py-3 text-base leading-7 text-primary shadow-soft outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-normal)] ease-[var(--ease-natural)] placeholder:text-muted hover:border-accent disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
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
