import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ScanFace, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  FaceVerificationPanel,
  type VerificationFailure,
} from "@/components/face/face-verification-panel";
import { logAudit } from "@/lib/audit";
import { fetchRole } from "@/lib/role-home";
import { decryptFaceImage } from "@/lib/face-crypto";
import { descriptorFromDataUrl, FACE_MATCH_MAX_DISTANCE } from "@/lib/face-match";

export const Route = createFileRoute("/_authenticated/face/verify")({
  head: () => ({
    meta: [
      { title: "Face verification — SATS" },
      {
        name: "description",
        content: "Verify your identity with biometric liveness detection to continue securely.",
      },
      { property: "og:title", content: "Face verification — SATS" },
      { property: "og:description", content: "Biometric verification for SATS." },
    ],
  }),
  component: FaceVerify,
});

const MAX_ATTEMPTS = 3;
const POSE_COLUMNS = [
  "image_front",
  "image_left",
  "image_right",
  "image_up",
  "image_smile",
] as const;

function FaceVerify() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [descriptors, setDescriptors] = useState<Float32Array[]>([]);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
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
        const { data: registration, error: regError } = await supabase
          .from("face_registrations")
          .select("status, image_front, image_left, image_right, image_up, image_smile")
          .eq("user_id", uid)
          .maybeSingle();
        if (cancelled) return;
        if (regError) throw new Error(regError.message);
        if (!registration || registration.status === "rejected") {
          navigate({ to: "/face/register" });
          return;
        }
        if (registration.status !== "approved") {
          navigate({ to: "/face/pending" });
          return;
        }

        setUserId(uid);
        setAttempts(profile?.face_verify_attempts ?? 0);
        logAudit("face_verify_started");

        // Derive embeddings from the existing encrypted enrollment, in memory only.
        const refs: Float32Array[] = [];
        for (const column of POSE_COLUMNS) {
          const stored = registration[column];
          if (!stored) continue;
          const image = await decryptFaceImage(uid, stored);
          const result = await descriptorFromDataUrl(image);
          if (result.ok) refs.push(result.descriptor);
        }
        if (cancelled) return;
        if (refs.length === 0) {
          setEnrollError(
            "We couldn't read a usable face from your registration. Please register your face again.",
          );
        }
        setDescriptors(refs);
      } catch (err) {
        if (cancelled) return;
        setEnrollError(
          err instanceof Error ? err.message : "Unable to load your face registration.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempts);

  async function handleVerified(match: { distance: number; confidence: number }) {
    if (!userId) return;
    await supabase.from("profiles").update({ face_verify_attempts: 0 }).eq("id", userId);
    await logAudit("face_verify_success", {
      attempts,
      distance: match.distance,
      confidence: match.confidence,
      maxDistance: FACE_MATCH_MAX_DISTANCE,
    });
    const role = await fetchRole(userId);
    const destination =
      role === "developer"
        ? "/dashboard/developer"
        : role === "company"
          ? "/dashboard/company"
          : role === "hr_lead"
            ? "/dashboard/hr-lead"
            : "/dashboard/recruiter";
    setTimeout(() => navigate({ to: destination }), 900);
  }

  function handleIssue(reason: VerificationFailure) {
    toast.error(
      reason === "multiple_faces"
        ? "Multiple faces detected — please be alone in frame."
        : reason === "no_face"
          ? "No face detected — center your face and retry."
          : "Face engine unavailable. Please retry.",
    );
  }

  async function handleFailed(match: { distance: number; confidence: number }) {
    if (!userId) return;
    const next = attempts + 1;
    setAttempts(next);
    await logAudit("face_verify_failed", {
      attempt: next,
      distance: match.distance,
      confidence: match.confidence,
      maxDistance: FACE_MATCH_MAX_DISTANCE,
    });
    toast.error(`Face not recognized. ${Math.max(0, MAX_ATTEMPTS - next)} attempt(s) remaining.`);
    try {
      if (next >= MAX_ATTEMPTS) {
        await supabase
          .from("profiles")
          .update({ face_verify_attempts: next, face_locked_at: new Date().toISOString() })
          .eq("id", userId);
        await logAudit("face_verify_locked", { attempts: next });
        navigate({ to: "/face/locked" });
        return;
      }
      await supabase.from("profiles").update({ face_verify_attempts: next }).eq("id", userId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error while saving your attempt.");
    }
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
              Preparing secure face matching…
            </div>
          ) : enrollError ? (
            <div className="glass-card grid h-96 place-items-center rounded-3xl px-6 text-center text-sm text-destructive">
              {enrollError}
            </div>
          ) : (
            <FaceVerificationPanel
              attemptsRemaining={attemptsRemaining}
              enrolledDescriptors={descriptors}
              onVerified={handleVerified}
              onFailed={handleFailed}
              onIssue={handleIssue}
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
