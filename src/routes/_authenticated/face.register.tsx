import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, ScanFace, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/face/register")({
  head: () => ({
    meta: [
      { title: "Face registration — SATS" },
      { name: "description", content: "Enroll your face for secure biometric verification across the SATS platform." },
      { property: "og:title", content: "Face registration — SATS" },
      { property: "og:description", content: "Enroll biometric identity for SATS." },
    ],
  }),
  component: FaceRegister,
});

const steps = [
  { title: "Position your face", desc: "Center yourself in the frame under even lighting." },
  { title: "Capture angles", desc: "Follow the prompts to capture front, left, and right." },
  { title: "Confirm & submit", desc: "Review the preview and store your secure template." },
];

function FaceRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [captured, setCaptured] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl animate-float" />
        <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-accent/25 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-8">
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
          {/* Left: guidance */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" /> Secure biometric enrollment
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight">
              Register your face in under a minute.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your biometric template is encrypted end-to-end and never leaves our verified enclaves.
            </p>

            <div className="mt-8 space-y-3">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  className={`glass-card flex gap-3 rounded-2xl p-4 transition ${
                    i === step ? "ring-2 ring-primary/40" : ""
                  }`}
                >
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                      i < step
                        ? "bg-primary text-primary-foreground"
                        : i === step
                        ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/80">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p>
                Your data is protected with AES-256 encryption and processed under SOC 2 & GDPR compliance.
              </p>
            </div>
          </div>

          {/* Right: scan preview */}
          <div className="glass-card rounded-3xl p-6 shadow-elegant">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-background to-accent/15">
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
                  <div className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
                  <div className="relative grid h-48 w-48 place-items-center rounded-full bg-gradient-primary shadow-elegant">
                    <ScanFace className="h-24 w-24 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* frame corners */}
              {[
                "left-4 top-4 border-l-2 border-t-2",
                "right-4 top-4 border-r-2 border-t-2",
                "left-4 bottom-4 border-l-2 border-b-2",
                "right-4 bottom-4 border-r-2 border-b-2",
              ].map((c) => (
                <div key={c} className={`absolute h-8 w-8 rounded-md border-primary ${c}`} />
              ))}

              {captured && (
                <div className="absolute inset-x-6 bottom-6 rounded-2xl glass-panel p-3 text-center text-sm font-semibold text-primary">
                  <CheckCircle2 className="mr-1 inline h-4 w-4" /> Frame captured
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setCaptured(true);
                  setTimeout(() => {
                    setCaptured(false);
                    setStep((s) => Math.min(s + 1, steps.length - 1));
                  }, 700);
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.01]"
              >
                <Camera className="h-4 w-4" /> Capture frame
              </button>
              <button
                onClick={() => navigate({ to: "/face/verify" })}
                disabled={step < steps.length - 1}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-semibold transition disabled:opacity-50"
              >
                Finish registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
