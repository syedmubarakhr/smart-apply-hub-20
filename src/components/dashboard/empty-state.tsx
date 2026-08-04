import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl border border-dashed border-border bg-background/40 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="max-w-sm">
        {Icon ? (
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
