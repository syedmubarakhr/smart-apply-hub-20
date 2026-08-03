import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileBarChart,
  FilePlus2,
  FileStack,
  ListChecks,
  Share2,
  Star,
  UserCheck,
  UserPlus,
  Users2,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Funnel,
  FunnelChart,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";

export const Route = createFileRoute("/_authenticated/dashboard/hr-lead/")({
  head: () => ({
    meta: [
      { title: "HR Lead Dashboard — SATS" },
      {
        name: "description",
        content:
          "HR Lead command centre: recruiter login status, JD flow, CV pipeline, interviews, selections, joinings, tasks and reports.",
      },
      { property: "og:title", content: "HR Lead Dashboard — SATS" },
      {
        property: "og:description",
        content: "Monitor recruiters, requisitions and the full hiring funnel in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HrLeadDashboard,
});

const EMPTY: { label: string; value: number }[] = [];

function Panel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

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
              description="Charts populate as recruiters work on live requisitions."
              className="border-none bg-background/70 backdrop-blur-sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Create JD", icon: FilePlus2 },
  { label: "Assign JD", icon: Share2 },
  { label: "Upload CV", icon: FileStack },
  { label: "Schedule interview", icon: CalendarCheck },
  { label: "Approve face registration", icon: UserCheck },
  { label: "Generate report", icon: FileBarChart },
];

function HrLeadDashboard() {
  return (
    <div className="space-y-6">
      {/* Recruiter login status */}
      <Panel
        title="Recruiter login status"
        description="Live presence of your recruiting team, refreshed in real time."
        icon={Users2}
      >
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Online now", value: "—" },
            { label: "Logged in today", value: "—" },
            { label: "Not logged in", value: "—" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-dashed border-border bg-background/40 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
        <EmptyState
          className="mt-4 h-40"
          icon={Users2}
          title="No recruiter sessions"
          description="Recruiter login activity appears here as your team signs in."
        />
      </Panel>

      {/* Requisition KPIs */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Requisitions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="JD received" value="—" icon={BriefcaseBusiness} />
          <StatCard label="JD assigned" value="—" icon={Share2} />
          <StatCard label="JD pending" value="—" icon={ClipboardList} tone="accent" />
        </div>
      </section>

      {/* Hiring funnel KPIs */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Hiring funnel
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="CV uploaded" value="—" icon={FileStack} />
          <StatCard label="CV shared" value="—" icon={Share2} />
          <StatCard label="Shortlisted" value="—" icon={Star} tone="accent" />
          <StatCard label="Interviewed" value="—" icon={CalendarCheck} />
          <StatCard label="Selected" value="—" icon={CheckCircle2} tone="accent" />
          <StatCard label="Joined" value="—" icon={UserPlus} />
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartFrame
            title="Pipeline movement"
            description="CVs uploaded, shared and shortlisted over time."
            empty={EMPTY.length === 0}
          >
            <LineChart data={EMPTY}>
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
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartFrame>
        </div>
        <ChartFrame
          title="Funnel conversion"
          description="Stage-to-stage drop-off across the hiring funnel."
          empty={EMPTY.length === 0}
        >
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={EMPTY} fill="var(--accent)" isAnimationActive={false}>
              <LabelList position="right" dataKey="label" fill="var(--muted-foreground)" />
            </Funnel>
          </FunnelChart>
        </ChartFrame>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartFrame
          title="Recruiter performance"
          description="Submissions and selections per recruiter."
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
            <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartFrame>

        <Panel
          title="Reports"
          description="Requisition, funnel and recruiter productivity exports."
          icon={FileBarChart}
        >
          <EmptyState
            className="mt-6 h-64"
            icon={FileBarChart}
            title="No reports generated"
            description="Scheduled and on-demand reports will be listed here once data exists."
          />
        </Panel>
      </section>

      {/* Tasks, notifications, quick actions */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Pending tasks"
          description="Approvals, assignments and follow-ups awaiting you."
          icon={ListChecks}
        >
          <EmptyState
            className="mt-6 h-56"
            icon={ListChecks}
            title="No pending tasks"
            description="Tasks assigned to you or your team will appear here."
          />
        </Panel>

        <Panel
          title="Notifications"
          description="Real-time alerts from recruiters and the AI engine."
          icon={Bell}
        >
          <EmptyState
            className="mt-6 h-56"
            icon={Bell}
            title="No notifications"
            description="You're all caught up — new alerts stream in live."
          />
        </Panel>

        <Panel
          title="Quick actions"
          description="Jump straight into your most common workflows."
          icon={Zap}
        >
          <div className="mt-6 grid gap-2">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  type="button"
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 text-left text-sm font-medium text-foreground transition hover:border-primary/40 hover:shadow-elegant"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{a.label}</span>
                </button>
              );
            })}
          </div>
        </Panel>
      </section>
    </div>
  );
}
