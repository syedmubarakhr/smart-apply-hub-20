import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, Loader2, LogOut, ScanFace, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signOut } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/face/pending")({
  head: () => ({
    meta: [
      { title: "Approval pending — SATS" },
      {
        name: "description",
        content: "Your biometric registration is awaiting HR Lead approval.",
      },
      { property: "og:title", content: "Approval pending — SATS" },
      { property: "og:description", content: "Awaiting HR approval of your face registration." },
    ],
  }),
  component: FacePending,
});

function FacePending() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("face_registrations")
        .select("status")
        .eq("user_id", uid)
        .maybeSingle();
      if (cancelled) return;
      const next = (data?.status as "pending" | "approved" | "rejected" | undefined) ?? null;
      setStatus(next);
      if (next === "approved") navigate({ to: "/face/verify" });
      if (next === "rejected") navigate({ to: "/face/register" });
      if (next === null) navigate({ to: "/face/register" });
    }

    check();
    const interval = window.setInterval(check, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [navigate]);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login/employee", replace: true });
  }

  const rejected = status === "rejected";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div
          className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-lg place-items-center px-4 py-10 sm:px-6">
        <div className="glass-card w-full rounded-3xl p-8 text-center shadow-elegant">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-primary/10">
            {rejected ? (
              <ScanFace className="h-10 w-10 text-destructive" />
            ) : (
              <Clock className="h-10 w-10 text-primary" />
            )}
          </div>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {rejected ? "Registration rejected" : "Pending approval"}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">
            {rejected ? "Your enrollment was rejected" : "Waiting for HR Lead Approval"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {rejected
              ? "Your HR Lead rejected this enrollment. You'll be taken back to face registration to try again."
              : "Your encrypted face template has been submitted. An HR Lead will review it shortly — this page updates automatically."}
          </p>

          {!rejected && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Checking status…
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-card"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
