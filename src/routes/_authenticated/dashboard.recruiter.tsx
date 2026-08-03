import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard/recruiter": {
    title: "Recruiter Workspace",
    subtitle: "Your tasks, requisitions, candidates and performance",
  },
};

export const Route = createFileRoute("/_authenticated/dashboard/recruiter")({
  component: RecruiterLayout,
});

function RecruiterLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = TITLES[pathname.replace(/\/$/, "") || "/dashboard/recruiter"] ?? {
    title: "Recruiter Console",
    subtitle: "Recruitment operations",
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="flex">
        <DashboardSidebar role="recruiter" open={open} onClose={() => setOpen(false)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <DashboardHeader
            title={meta.title}
            subtitle={meta.subtitle}
            onOpenSidebar={() => setOpen(true)}
            userLabel="Recruiter"
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
