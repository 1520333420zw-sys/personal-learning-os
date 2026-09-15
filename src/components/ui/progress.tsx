import { cn } from "@/lib/cn";

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  className,
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((safeValue / safeMax) * 100);

  return (
    <div className={cn("grid gap-2", className)}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-4 type-small">
          {label ? (
            <span className="font-medium text-secondary">{label}</span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span className="tabular-nums text-muted">{percentage}%</span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        className={cn(
          "w-full overflow-hidden rounded-full bg-accent-soft",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-[var(--duration-normal)] ease-[var(--ease-natural)]"
          style={{ width: percentage + "%" }}
        />
      </div>
    </div>
  );
}
