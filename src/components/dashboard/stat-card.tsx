import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "primary" | "accent";
  className?: string;
}

export function StatCard({
  label,
  value,
  hint = "Awaiting data",
  icon: Icon,
  tone = "primary",
  className,
}: StatCardProps) {
  return (
    <div className={cn("glass-card rounded-2xl p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-elegant",
            tone === "accent"
              ? "bg-gradient-accent text-accent-foreground"
              : "bg-gradient-primary text-primary-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
