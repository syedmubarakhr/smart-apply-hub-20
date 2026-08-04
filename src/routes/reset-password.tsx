import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { supabase } from "@/integrations/supabase/client";
import { updatePassword } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — SATS" },
      { name: "description", content: "Choose a new password for your SATS account." },
      { property: "og:title", content: "Set a new password — SATS" },
      { property: "og:description", content: "Set a new SATS password." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) return setError(error);
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/login/company" }), 1500);
  }

  return (
    <AuthShell
      eyebrow="New password"
      title="Choose a strong new password."
      description="You'll be signed out of other sessions and asked to sign in with your new password."
      footer={
        <div className="flex items-center justify-between">
          <span>Need help?</span>
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      }
    >
      {done ? (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          Password updated. Redirecting to sign in…
        </div>
      ) : !ready ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Validating reset link…
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
            Update password
          </button>
        </form>
      )}
    </AuthShell>
  );
}
