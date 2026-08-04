import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, LogOut, Mail, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signOut } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/face/locked")({
  head: () => ({
    meta: [
      { title: "Account locked — SATS" },
      {
        name: "description",
        content: "Your account has been locked after multiple failed face verification attempts.",
      },
      { property: "og:title", content: "Account locked — SATS" },
      { property: "og:description", content: "Contact your administrator to restore access." },
    ],
  }),
  component: FaceLocked,
});

function FaceLocked() {
  const navigate = useNavigate();
  const [lockedAt, setLockedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("face_locked_at")
        .eq("id", uid)
        .maybeSingle();
      setLockedAt(profile?.face_locked_at ?? null);
    })();
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login/employee" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-destructive/20 blur-3xl animate-float" />
        <div
          className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-lg place-items-center px-6 py-10">
        <div className="glass-card w-full rounded-3xl p-8 text-center shadow-elegant">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-destructive/10">
            <Lock className="h-10 w-10 text-destructive" />
          </div>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
            <ShieldAlert className="h-3.5 w-3.5" /> Account locked
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">Too many failed attempts</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            For your security, we've locked biometric access to this account after 3 failed
            verification attempts. Contact your HR administrator to restore access.
          </p>

          {lockedAt && (
            <p className="mt-4 text-xs text-muted-foreground">
              Locked at {new Date(lockedAt).toLocaleString()}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <a
              href="mailto:security@sats.example"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.01]"
            >
              <Mail className="h-4 w-4" /> Contact administrator
            </a>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-semibold transition hover:bg-card"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
