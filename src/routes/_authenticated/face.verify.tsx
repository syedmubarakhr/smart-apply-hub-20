import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ScanFace, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FaceVerificationPanel } from "@/components/face/face-verification-panel";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authenticated/face/verify")({
  head: () => ({
    meta: [
      { title: "Face verification — SATS" },
      { name: "description", content: "Verify your identity with biometric liveness detection to continue securely." },
      { property: "og:title", content: "Face verification — SATS" },
      { property: "og:description", content: "Biometric verification for SATS." },
    ],
  }),
  component: FaceVerify,
});

const MAX_ATTEMPTS = 3;

function FaceVerify() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      if (!uid) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("face_verify_attempts, face_locked_at")
        .eq("id", uid)
        .maybeSingle();
      if (cancelled) return;
      if (profile?.face_locked_at) {
        navigate({ to: "/face/locked" });
        return;
      }
      setUserId(uid);
      setAttempts(profile?.face_verify_attempts ?? 0);
      setLoading(false);
      logAudit("face_verify_started");
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempts);

  async function handleVerified() {
    if (!userId) return;
    await supabase
      .from("profiles")
      .update({ face_verify_attempts: 0 })
      .eq("id", userId);
    await logAudit("face_verify_success", { attempts });
    setTimeout(() => navigate({ to: "/dashboard/company" }), 900);
  }

  async function handleFailed() {
    if (!userId) return;
    const next = attempts + 1;
    setAttempts(next);
    await logAudit("face_verify_failed", { attempt: next });
    if (next >= MAX_ATTEMPTS) {
      await supabase
        .from("profiles")
        .update({ face_verify_attempts: next, face_locked_at: new Date().toISOString() })
        .eq("id", userId);
      await logAudit("face_verify_locked", { attempts: next });
      navigate({ to: "/face/locked" });
      return;
    }
    await supabase
      .from("profiles")
      .update({ face_verify_attempts: next })
      .eq("id", userId);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-accent/25 blur-3xl animate-float" />
        <div
          className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-primary/25 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
              <ScanFace className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">SATS</span>
          </Link>
          <Link
            to="/login/employee"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
          </Link>
        </div>

        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Liveness verification
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold">Verify it's really you</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Look directly at the camera. You have {MAX_ATTEMPTS} attempts before your account locks.
          </p>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="glass-card grid h-96 place-items-center rounded-3xl text-sm text-muted-foreground">
              Loading verification…
            </div>
          ) : (
            <FaceVerificationPanel
              attemptsRemaining={attemptsRemaining}
              onVerified={handleVerified}
              onFailed={handleFailed}
            />
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Haven't registered yet?{" "}
          <Link to="/face/register" className="font-semibold text-primary hover:underline">
            Register your face
          </Link>
        </p>
      </div>
    </div>
  );
}
