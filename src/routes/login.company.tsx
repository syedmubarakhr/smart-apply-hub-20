import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/login/company")({
  head: () => ({
    meta: [
      { title: "Company sign in — SATS" },
      { name: "description", content: "Sign in to your SATS workspace to manage candidates, jobs, and hiring pipelines." },
      { property: "og:title", content: "Company sign in — SATS" },
      { property: "og:description", content: "Sign in to your SATS company workspace." },
    ],
  }),
  component: CompanyLogin,
});

function CompanyLogin() {
  return (
    <AuthShell
      eyebrow="Company workspace"
      title="Run your entire hiring pipeline from one place."
      description="From sourcing to onboarding — track every candidate, decision, and interview with clarity."
      footer={
        <div className="flex items-center justify-between">
          <span>New here?</span>
          <Link to="/login/company" className="font-semibold text-primary hover:underline">Request a demo</Link>
        </div>
      }
    >
      <LoginForm role="company" redirectTo="/login/employee" cta="Sign in to company workspace" identifierLabel="Company ID (email)" />
    </AuthShell>
  );
}
