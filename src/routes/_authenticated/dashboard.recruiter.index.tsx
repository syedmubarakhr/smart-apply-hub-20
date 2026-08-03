import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardList,
  FileBarChart,
  FileStack,
  ListChecks,
  Share2,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/dashboard/empty-state";

export const Route = createFileRoute("/_authenticated/dashboard/recruiter/")({
  head: () => ({
    meta: [
      { title: "Recruiter Dashboard — SATS" },
      {
        name: "description",
        content:
          "Recruiter workspace: today's tasks, assigned and pending JDs, CV uploads, AI match scores, interviews, activity and performance.",
      },
      { property: "og:title", content: "Recruiter Dashboard — SATS" },
      {
        property: "og:description",
        content: "Track your requisitions, candidates, interviews and performance in one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecruiterDashboard,
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
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
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
              description="Charts populate as you work on live requisitions."
              className="border-none bg-background/70 backdrop-blur-sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Upload CV", icon: UploadCloud },
  { label: "Share candidate", icon: Share2 },
  { label: "Run AI match", icon: Sparkles },
  { label: "Schedule interview", icon: CalendarCheck },
  { label: "Update task", icon: ListChecks },
  { label: "Generate my report", icon: FileBarChart },
];

function RecruiterDashboard() {
  return (
    <div className="space-y-6">
      {/* Today's tasks */}
      <Panel
        title="Today's tasks"
        description="Everything due today across your assigned requisitions."
        icon={ListChecks}
      >
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Due today", value: "—" },
            { label: "In progress", value: "—" },
            { label: "Overdue", value: "—" },
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
          icon={ListChecks}
          title="No tasks for today"
          description="Assigned tasks and follow-ups will appear here."
        />
      </Panel>

      {/* Requisitions */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          My requisitions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Assigned JD" value="—" icon={BriefcaseBusiness} />
          <StatCard label="Pending JD" value="—" icon={ClipboardList} tone="accent" />
          <StatCard label="CV uploaded" value="—" icon={FileStack} />
        </div>
      </section>

      {/* Candidate work */}
      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Candidate pipeline
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="AI match" value="—" hint="Average match score" icon={BrainCircuit} tone="accent" />
          <StatCard label="Interviews" value="—" hint="Scheduled this week" icon={CalendarCheck} />
          <StatCard label="Performance" value="—" hint="Selections vs target" icon={TrendingUp} tone="accent" />
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartFrame
            title="My pipeline movement"
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
          title="AI match distribution"
          description="How your submitted candidates score against JDs."
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

      {/* Activity + notifications */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Recent activity"
          description="Your latest uploads, shares, interviews and status changes."
          icon={Activity}
        >
          <EmptyState
            className="mt-6 h-56"
            icon={Activity}
            title="No recent activity"
            description="Your actions across requisitions and candidates will be listed here."
          />
        </Panel>

        <Panel
          title="Notifications"
          description="Alerts from your HR Lead and the AI engine."
          icon={Bell}
        >
          <EmptyState
            className="mt-6 h-56"
            icon={Bell}
            title="No notifications"
            description="You're all caught up — new alerts stream in live."
          />
        </Panel>
      </section>

      {/* Quick actions + reports */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Quick actions"
          description="Jump straight into your most common workflows."
          icon={Zap}
        >
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
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

        <Panel
          title="My reports"
          description="Personal productivity and submission exports."
          icon={FileBarChart}
        >
          <EmptyState
            className="mt-6 h-56"
            icon={FileBarChart}
            title="No reports generated"
            description="Your on-demand and scheduled reports will be listed here."
          />
        </Panel>
      </section>
    </div>
  );
}
