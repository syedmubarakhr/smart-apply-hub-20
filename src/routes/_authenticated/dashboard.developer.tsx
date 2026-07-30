import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard/developer": {
    title: "Developer Overview",
    subtitle: "Platform-wide health, tenants, and activity",
  },
  "/dashboard/developer/companies": {
    title: "Companies",
    subtitle: "Tenant organisations onboarded to SATS",
  },
  "/dashboard/developer/users": {
    title: "Users",
    subtitle: "All accounts across every tenant",
  },
  "/dashboard/developer/roles": {
    title: "Roles",
    subtitle: "Role definitions and assignment rules",
  },
  "/dashboard/developer/permissions": {
    title: "Permissions",
    subtitle: "Granular capability grants per role",
  },
  "/dashboard/developer/departments": {
    title: "Departments",
    subtitle: "Organisational units inside each tenant",
  },
  "/dashboard/developer/holidays": {
    title: "Holiday Management",
    subtitle: "Calendars, regional holidays, and overrides",
  },
  "/dashboard/developer/ai-engine": {
    title: "AI Engine",
    subtitle: "Matching models, thresholds, and inference usage",
  },
  "/dashboard/developer/reports": {
    title: "Reports",
    subtitle: "Exportable platform and tenant reporting",
  },
  "/dashboard/developer/audit-logs": {
    title: "Audit Logs",
    subtitle: "Security and compliance event trail",
  },
  "/dashboard/developer/settings": {
    title: "Settings",
    subtitle: "Platform configuration and preferences",
  },
};

export const Route = createFileRoute("/_authenticated/dashboard/developer")({
  component: DeveloperLayout,
});

function DeveloperLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = TITLES[pathname.replace(/\/$/, "") || "/dashboard/developer"] ?? {
    title: "Developer Console",
    subtitle: "Platform administration",
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="flex">
        <DashboardSidebar role="developer" open={open} onClose={() => setOpen(false)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <DashboardHeader
            title={meta.title}
            subtitle={meta.subtitle}
            onOpenSidebar={() => setOpen(true)}
            userLabel="Dev Team"
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
