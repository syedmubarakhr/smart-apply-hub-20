import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { sendPasswordReset } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — SATS" },
      { name: "description", content: "Reset your SATS account password securely." },
      { property: "og:title", content: "Forgot password — SATS" },
      { property: "og:description", content: "Reset your SATS password." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await sendPasswordReset(email);
    setLoading(false);
    if (error) return setError(error);
    setSent(true);
  }

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Reset your password securely."
      description="We'll email you a secure link to set a new password. The link expires shortly for your safety."
      footer={
        <div className="flex items-center justify-between">
          <span>Remembered it?</span>
          <Link to="/login/company" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      }
    >
      {sent ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          Check your inbox for a reset link at <span className="font-semibold">{email}</span>.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-input bg-card/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.01] disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}
