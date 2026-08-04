import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WebcamCapture, type WebcamCaptureHandle } from "@/components/webcam/webcam-capture";
import { encryptFaceImage } from "@/lib/face-crypto";

export const Route = createFileRoute("/_authenticated/face/register")({
  head: () => ({
    meta: [
      { title: "Face registration — SATS" },
      {
        name: "description",
        content: "Enroll your face for secure biometric verification across the SATS platform.",
      },
      { property: "og:title", content: "Face registration — SATS" },
      { property: "og:description", content: "Enroll biometric identity for SATS." },
    ],
  }),
  component: FaceRegister,
});

const POSES = [
  { key: "image_front", title: "Look straight ahead", desc: "Center your face in the circle." },
  { key: "image_left", title: "Turn slightly left", desc: "Keep your eyes on the camera." },
  { key: "image_right", title: "Turn slightly right", desc: "Hold still for a moment." },
  { key: "image_up", title: "Tilt your head up", desc: "Chin slightly raised." },
  { key: "image_smile", title: "Smile", desc: "A natural smile works best." },
] as const;

type PoseKey = (typeof POSES)[number]["key"];

function FaceRegister() {
  const navigate = useNavigate();
  const webcamRef = useRef<WebcamCaptureHandle | null>(null);
  const [step, setStep] = useState(0);
  const [shots, setShots] = useState<Partial<Record<PoseKey, string>>>({});
  const [flash, setFlash] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pose = POSES[step];
  const complete = POSES.every((p) => shots[p.key]);

  function capture() {
    const frame = webcamRef.current?.capture();
    if (!frame) {
      toast.error("Camera isn't ready yet — please allow access and wait a moment.");
      return;
    }
    setShots((prev) => ({ ...prev, [pose.key]: frame }));
    setFlash(true);
    window.setTimeout(() => {
      setFlash(false);
      setStep((s) => Math.min(s + 1, POSES.length - 1));
    }, 550);
  }

  function retake(key: PoseKey, index: number) {
    setShots((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setStep(index);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Your session expired. Please sign in again.");

      const encrypted = await Promise.all(
        POSES.map(async (p) => [p.key, await encryptFaceImage(uid, shots[p.key]!)] as const),
      );
      const payload = Object.fromEntries(encrypted) as Record<PoseKey, string>;

      const { error } = await supabase.from("face_registrations").insert({
        user_id: uid,
        status: "pending",
        ...payload,
      });
      if (error) throw new Error(error.message);

      toast.success("Face registered — pending HR approval.");
      navigate({ to: "/face/pending" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl animate-float" />
        <div
          className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-accent/25 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
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
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" /> Secure biometric enrollment
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight">
              Register your face in under a minute.
            </h1>
            <p className="mt-3 text-muted-foreground">
              We capture five poses, encrypt them on this device, and store them for HR approval.
            </p>

            <div className="mt-8 space-y-3">
              {POSES.map((p, i) => {
                const done = Boolean(shots[p.key]);
                return (
                  <div
                    key={p.key}
                    className={`glass-card flex items-center gap-3 rounded-2xl p-4 transition ${
                      i === step ? "ring-2 ring-primary/40" : ""
                    }`}
                  >
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : i === step
                            ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{p.title}</p>
                      <p className="text-sm text-muted-foreground">{p.desc}</p>
                    </div>
                    {done && (
                      <button
                        onClick={() => retake(p.key, i)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                      >
                        <RotateCcw className="h-3 w-3" /> Retake
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/80">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p>Captures are encrypted with AES-256-GCM in your browser before they are stored.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-elegant">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full border-4 border-primary/20">
              <WebcamCapture
                ref={webcamRef}
                className="h-full w-full rounded-full"
                overlay={
                  flash ? (
                    <div className="absolute inset-0 grid place-items-center rounded-full bg-primary/40 backdrop-blur-sm">
                      <CheckCircle2 className="h-16 w-16 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 rounded-full ring-2 ring-primary/40" />
                  )
                }
              />
            </div>

            <p className="mt-5 text-center text-sm font-semibold text-foreground">
              Step {step + 1} of {POSES.length} — {pose.title}
            </p>
            <p className="text-center text-xs text-muted-foreground">{pose.desc}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={capture}
                disabled={submitting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.01] disabled:opacity-60"
              >
                <Camera className="h-4 w-4" /> Capture {pose.title.toLowerCase()}
              </button>
              <button
                onClick={submit}
                disabled={!complete || submitting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-card disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Submit for approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
