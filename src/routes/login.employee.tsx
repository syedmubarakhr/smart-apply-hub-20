import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/login/employee")({
  head: () => ({
    meta: [
      { title: "Employee sign in — SATS" },
      { name: "description", content: "Sign in as an applicant or employee to track your application status and verify your identity." },
      { property: "og:title", content: "Employee sign in — SATS" },
      { property: "og:description", content: "Sign in to the SATS employee portal." },
    ],
  }),
  component: EmployeeLogin,
});

function EmployeeLogin() {
  return (
    <AuthShell
      accent="orange"
      eyebrow="Employee portal"
      title="Track your application. Verify your identity."
      description="See your status in real time, complete face verification, and stay in the loop across every stage."
      footer={
        <div className="flex items-center justify-between">
          <span>Need to verify?</span>
          <Link to="/face/register" className="font-semibold text-accent hover:underline">Register your face</Link>
        </div>
      }
    >
      <LoginForm role="employee" redirectTo="/face/verify" cta="Sign in to portal" accent="orange" />
    </AuthShell>
  );
}
