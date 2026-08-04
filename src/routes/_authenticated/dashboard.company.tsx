import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Briefcase, ScanFace, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/company")({
  head: () => ({
    meta: [
      { title: "Company dashboard — SATS" },
      {
        name: "description",
        content: "Track candidates, jobs, and hiring performance across your organization.",
      },
      { property: "og:title", content: "Company dashboard — SATS" },
      { property: "og:description", content: "Company workspace overview." },
    ],
  }),
  component: CompanyDashboard,
});

function CompanyDashboard() {
  const [open, setOpen] = useState(false);

  const stats = [
    { label: "Open roles", value: "—", icon: Briefcase, tone: "primary" as const },
    { label: "Candidates in pipeline", value: "—", icon: Users, tone: "primary" as const },
    { label: "Verified applicants", value: "—", icon: ScanFace, tone: "accent" as const },
    { label: "Offer acceptance rate", value: "—", icon: TrendingUp, tone: "accent" as const },
  ];

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="flex">
        <DashboardSidebar role="company" open={open} onClose={() => setOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardHeader
            title="Hiring Overview"
            subtitle="Your pipelines, roles, and verifications at a glance"
            onOpenSidebar={() => setOpen(true)}
            userLabel="Acme HR"
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {s.label}
                      </p>
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-elegant ${s.tone === "accent" ? "bg-gradient-accent" : "bg-gradient-primary"}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Awaiting data</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="glass-card rounded-2xl p-6 lg:col-span-2">
                <h2 className="font-display text-lg font-bold">Pipeline flow</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kanban of candidates by stage will render here.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {["Applied", "Screening", "Interview", "Offer"].map((stage) => (
                    <div
                      key={stage}
                      className="rounded-xl border border-dashed border-border bg-background/40 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {stage}
                      </p>
                      <p className="mt-8 text-center text-sm text-muted-foreground">Empty</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold">Upcoming interviews</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scheduled sessions will appear here.
                </p>
                <div className="mt-6 grid h-64 place-items-center rounded-xl border border-dashed border-border bg-background/40 text-sm text-muted-foreground">
                  Nothing scheduled
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
