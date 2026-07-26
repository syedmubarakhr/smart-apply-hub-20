import { Bell, Menu, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface Props {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  userLabel: string;
}

export function DashboardHeader({ title, subtitle, onOpenSidebar, userLabel }: Props) {
  const initials = userLabel
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-bold text-foreground sm:text-xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="hidden min-w-0 items-center md:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search candidates, jobs, tenants…"
              className="w-full rounded-full border border-input bg-card/60 py-2 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-self-end">
          <button className="relative rounded-full p-2 text-muted-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3 shadow-sm transition hover:shadow-elegant"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
              {initials || "SA"}
            </span>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {userLabel}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
