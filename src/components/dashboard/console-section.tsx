import type { ComponentType } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";

interface Props {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function ConsoleSection({
  icon: Icon,
  title,
  description,
  emptyTitle,
  emptyDescription,
}: Props) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <EmptyState
        className="mt-6 min-h-72"
        icon={Icon}
        title={emptyTitle}
        description={emptyDescription}
      />
    </div>
  );
}
