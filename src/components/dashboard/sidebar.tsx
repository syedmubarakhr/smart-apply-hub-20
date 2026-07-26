import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ScanFace,
  Settings,
  BarChart3,
  Building2,
  Code2,
  FileText,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarRole = "developer" | "company";

const NAV: Record<SidebarRole, { section: string; items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[]> = {
  developer: [
    {
      section: "Platform",
      items: [
        { to: "/dashboard/developer", label: "Overview", icon: LayoutDashboard },
        { to: "/dashboard/developer", label: "Tenants", icon: Building2 },
        { to: "/dashboard/developer", label: "API Keys", icon: Code2 },
        { to: "/dashboard/developer", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      section: "System",
      items: [
        { to: "/dashboard/developer", label: "Audit Logs", icon: FileText },
        { to: "/dashboard/developer", label: "Security", icon: Shield },
        { to: "/dashboard/developer", label: "Settings", icon: Settings },
      ],
    },
  ],
  company: [
    {
      section: "Hiring",
      items: [
        { to: "/dashboard/company", label: "Overview", icon: LayoutDashboard },
        { to: "/dashboard/company", label: "Candidates", icon: Users },
        { to: "/dashboard/company", label: "Job Postings", icon: Briefcase },
        { to: "/dashboard/company", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      section: "Verification",
      items: [
        { to: "/face/register", label: "Face Registration", icon: ScanFace },
        { to: "/face/verify", label: "Face Verification", icon: Shield },
        { to: "/dashboard/company", label: "Settings", icon: Settings },
      ],
    },
  ],
};

interface Props {
  role: SidebarRole;
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ role, open, onClose }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const groups = NAV[role];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
              <ScanFace className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold text-sidebar-foreground">SATS</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {role} console
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {groups.map((group) => (
            <div key={group.section}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.section}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs font-semibold text-sidebar-foreground">Need help?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Chat with our team about your rollout.
            </p>
            <button className="mt-3 w-full rounded-lg bg-gradient-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-glow">
              Contact support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
