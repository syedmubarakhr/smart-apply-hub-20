import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard/hr-lead": {
    title: "HR Lead Overview",
    subtitle: "Recruiter status, requisition flow, and hiring funnel",
  },
  "/dashboard/hr-lead/face-approvals": {
    title: "Face Registration Approval",
    subtitle: "Review, approve, or reject employee biometric enrollment",
  },
};

export const Route = createFileRoute("/_authenticated/dashboard/hr-lead")({
  component: HrLeadLayout,
});

function HrLeadLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = TITLES[pathname.replace(/\/$/, "") || "/dashboard/hr-lead"] ?? {
    title: "HR Lead Console",
    subtitle: "Recruitment operations",
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="flex">
        <DashboardSidebar role="hr_lead" open={open} onClose={() => setOpen(false)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <DashboardHeader
            title={meta.title}
            subtitle={meta.subtitle}
            onOpenSidebar={() => setOpen(true)}
            userLabel="HR Lead"
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
