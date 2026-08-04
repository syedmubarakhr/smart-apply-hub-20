import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Code2,
  ScanFace,
  Shield,
  Sparkles,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SATS — Smart Applicant Tracking System" },
      {
        name: "description",
        content:
          "Modern applicant tracking with biometric verification, real-time analytics, and enterprise-grade security.",
      },
      { property: "og:title", content: "SATS — Smart Applicant Tracking System" },
      {
        property: "og:description",
        content:
          "Modern applicant tracking with biometric verification, real-time analytics, and enterprise-grade security.",
      },
    ],
  }),
  component: Landing,
});

const roles = [
  {
    to: "/login/developer",
    title: "Developer",
    desc: "Build integrations & manage tenants",
    icon: Code2,
    tone: "bg-primary/10 text-primary",
  },
  {
    to: "/login/company",
    title: "Company",
    desc: "Manage hiring pipelines & teams",
    icon: Building2,
    tone: "bg-accent/15 text-accent",
  },
  {
    to: "/login/employee",
    title: "Employee",
    desc: "Track applications & verify identity",
    icon: UserRound,
    tone: "bg-primary/10 text-primary",
  },
] as const;

const features = [
  {
    icon: ScanFace,
    title: "Biometric verification",
    desc: "Face registration & liveness detection stops fraudulent applicants at the door.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    desc: "Every stage of the funnel measured — time-to-hire, drop-off, source ROI.",
  },
  {
    icon: Shield,
    title: "Enterprise security",
    desc: "SOC 2, ISO 27001 & GDPR-ready with role-based permissions across every workspace.",
  },
  {
    icon: Zap,
    title: "Automations",
    desc: "Route candidates, schedule interviews, and trigger actions from a single canvas.",
  },
  {
    icon: Users,
    title: "Collaborative hiring",
    desc: "Scorecards, notes, and structured interviews keep every stakeholder aligned.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted screening",
    desc: "Rank candidates against role fit while preserving fairness and transparency.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
              <ScanFace className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">SATS</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#roles" className="hover:text-foreground">
              For teams
            </a>
            <a href="#security" className="hover:text-foreground">
              Security
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login/company"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/login/company"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.02]"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-mesh">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-primary/25 blur-3xl animate-float" />
          <div
            className="absolute right-0 top-40 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl animate-float"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              The next-generation ATS for enterprise hiring
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Hire faster.
              <br />
              <span className="text-gradient">Verify smarter.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              SATS combines applicant tracking, biometric identity, and real-time analytics into one
              modern platform built for teams that hire at scale.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login/company"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.02]"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/face/register"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:shadow-elegant"
              >
                <ScanFace className="h-4 w-4 text-accent" /> See face verification
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              {["SOC 2 Type II", "ISO 27001", "GDPR", "99.99% uptime"].map((b) => (
                <div key={b} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> {b}
                </div>
              ))}
            </div>
          </div>

          {/* Hero preview card */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="glass-card rounded-3xl p-3 shadow-elegant">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Candidates in pipeline", value: "12,480", trend: "+18%" },
                    { label: "Time to hire", value: "9.2d", trend: "-24%" },
                    { label: "Verification pass rate", value: "98.7%", trend: "+3.1%" },
                  ].map((s) => (
                    <div key={s.label} className="glass-panel rounded-2xl p-5">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                      <p className="mt-1 text-xs font-semibold text-primary">
                        {s.trend} this quarter
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold">Choose your workspace</h2>
          <p className="mt-3 text-muted-foreground">
            Three tailored consoles. One unified platform.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.title}
                to={r.to}
                className="group glass-card relative overflow-hidden rounded-3xl p-8 transition hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className={`inline-grid h-12 w-12 place-items-center rounded-2xl ${r.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-mesh py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Platform
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold">
              Everything a modern hiring team needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built for velocity without compromising trust, fairness, or security.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="glass-card rounded-2xl p-6 transition hover:-translate-y-1"
                >
                  <div className="inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 text-primary-foreground shadow-elegant">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl font-bold">
              Ready to modernize your hiring stack?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Deploy SATS in days, not quarters. White-glove onboarding included.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/login/company"
                className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-elegant transition hover:scale-[1.02]"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login/developer"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-white/20"
              >
                Developer sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer id="security" className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary">
              <ScanFace className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">SATS</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Security
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
