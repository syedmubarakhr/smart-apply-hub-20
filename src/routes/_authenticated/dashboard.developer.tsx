import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Activity, Code2, Users2, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/developer")({
  head: () => ({
    meta: [
      { title: "Developer dashboard — SATS" },
      { name: "description", content: "Manage tenants, integrations, API usage, and platform observability." },
      { property: "og:title", content: "Developer dashboard — SATS" },
      { property: "og:description", content: "Developer console overview." },
    ],
  }),
  component: DeveloperDashboard,
});

function DeveloperDashboard() {
  const [open, setOpen] = useState(false);

  const stats = [
    { label: "Active tenants", value: "—", icon: Users2 },
    { label: "API calls / 24h", value: "—", icon: Activity },
    { label: "Integrations", value: "—", icon: Code2 },
    { label: "System health", value: "—", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="flex">
        <DashboardSidebar role="developer" open={open} onClose={() => setOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardHeader
            title="Developer Overview"
            subtitle="Monitor tenants, integrations, and platform health"
            onOpenSidebar={() => setOpen(true)}
            userLabel="Dev Team"
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
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
                <h2 className="font-display text-lg font-bold">Platform activity</h2>
                <p className="mt-1 text-sm text-muted-foreground">Charts and event streams will render here.</p>
                <div className="mt-6 grid h-64 place-items-center rounded-xl border border-dashed border-border bg-background/40 text-sm text-muted-foreground">
                  Empty state — connect data sources to populate.
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-lg font-bold">Recent tenants</h2>
                <p className="mt-1 text-sm text-muted-foreground">Newly onboarded workspaces.</p>
                <div className="mt-6 grid h-64 place-items-center rounded-xl border border-dashed border-border bg-background/40 text-sm text-muted-foreground">
                  Nothing yet
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
