import { createFileRoute } from "@tanstack/react-router";
import { Activity, Building2, CreditCard, LogIn, ServerCog, Users2 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";

export const Route = createFileRoute("/_authenticated/dashboard/developer/")({
  head: () => ({
    meta: [
      { title: "Developer Dashboard — SATS" },
      {
        name: "description",
        content:
          "Platform overview for SATS: companies, active users, logins, system health, subscriptions, and audit activity.",
      },
      { property: "og:title", content: "Developer Dashboard — SATS" },
      {
        property: "og:description",
        content: "Monitor tenants, users, system health, and subscription status across SATS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeveloperDashboard,
});

const EMPTY: { label: string; value: number }[] = [];

function ChartFrame({
  title,
  description,
  children,
  empty,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  empty: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="relative mt-6 h-64">
        <div className="absolute inset-0 opacity-40">
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
        {empty ? (
          <div className="absolute inset-0 grid place-items-center">
            <EmptyState
              title="No data yet"
              description="Metrics appear once tenants start using the platform."
              className="border-none bg-background/70 backdrop-blur-sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DeveloperDashboard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total companies" value="—" icon={Building2} />
        <StatCard label="Active users" value="—" icon={Users2} />
        <StatCard label="Today's logins" value="—" icon={LogIn} tone="accent" />
        <StatCard label="System health" value="—" hint="No probes reporting" icon={ServerCog} />
        <StatCard
          label="Subscription status"
          value="—"
          hint="No billing plan connected"
          icon={CreditCard}
          tone="accent"
        />
        <StatCard label="Events / 24h" value="—" hint="No audit events" icon={Activity} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartFrame
            title="Login activity"
            description="Daily authentications across all tenants."
            empty={EMPTY.length === 0}
          >
            <AreaChart data={EMPTY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ChartFrame>
        </div>
        <ChartFrame
          title="Companies onboarded"
          description="New tenants per month."
          empty={EMPTY.length === 0}
        >
          <BarChart data={EMPTY}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip />
            <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartFrame>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Latest activities</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Most recent security and platform events.
              </p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <EmptyState
            className="mt-6 h-56"
            icon={Activity}
            title="No activity recorded"
            description="Audit events will stream in as users sign in and administrators make changes."
          />
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Recent companies</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Newly onboarded tenant workspaces.
              </p>
            </div>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <EmptyState
            className="mt-6 h-56"
            icon={Building2}
            title="No companies yet"
            description="Onboard your first tenant to see it listed here."
          />
        </div>
      </section>
    </div>
  );
}
