import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/login/developer")({
  head: () => ({
    meta: [
      { title: "Developer sign in — SATS" },
      { name: "description", content: "Sign in to the SATS developer console to manage tenants, integrations, and APIs." },
      { property: "og:title", content: "Developer sign in — SATS" },
      { property: "og:description", content: "Sign in to the SATS developer console." },
    ],
  }),
  component: DeveloperLogin,
});

function DeveloperLogin() {
  return (
    <AuthShell
      eyebrow="Developer console"
      title="Build the platform behind the platform."
      description="Manage tenants, API keys, webhooks, and integrations from a single unified developer workspace."
      footer={
        <div className="flex items-center justify-between">
          <span>Not a developer?</span>
          <div className="flex gap-3">
            <Link to="/login/company" className="font-semibold text-primary hover:underline">Company</Link>
            <Link to="/login/employee" className="font-semibold text-primary hover:underline">Employee</Link>
          </div>
        </div>
      }
    >
      <LoginForm role="developer" redirectTo="/dashboard/developer" cta="Sign in to developer console" />
    </AuthShell>
  );
}
