import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ScanFace, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/face/verify")({
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

type Status = "idle" | "scanning" | "success";

function FaceVerify() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("idle");

  function start() {
    setStatus("scanning");
    setTimeout(() => setStatus("success"), 1800);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-accent/25 blur-3xl animate-float" />
        <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-primary/25 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
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

        <div className="mt-10 glass-card rounded-3xl p-8 shadow-elegant">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Liveness verification
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold">Verify it's really you</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Look at the camera and follow the on-screen prompts. This should only take a few seconds.
            </p>
          </div>

          <div className="relative mx-auto mt-8 aspect-square w-full max-w-md overflow-hidden rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <div className="absolute inset-0 grid place-items-center">
              {status === "success" ? (
                <div className="grid h-40 w-40 place-items-center rounded-full bg-gradient-primary shadow-elegant">
                  <CheckCircle2 className="h-24 w-24 text-primary-foreground" />
                </div>
              ) : (
                <div className="relative">
                  {status === "scanning" && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
                      <div className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" style={{ animationDelay: "0.6s" }} />
                    </>
                  )}
                  <div className="relative grid h-40 w-40 place-items-center rounded-full bg-gradient-primary shadow-elegant">
                    <ScanFace className="h-20 w-20 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>

            {status === "scanning" && (
              <div className="absolute inset-x-0 top-0 h-1 origin-left animate-[shimmer_1.8s_linear_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {status === "idle" && (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.02]"
              >
                <ScanFace className="h-4 w-4" /> Start verification
              </button>
            )}
            {status === "scanning" && (
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant opacity-80"
              >
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
              </button>
            )}
            {status === "success" && (
              <>
                <p className="w-full text-center text-sm font-semibold text-primary">
                  <CheckCircle2 className="mr-1 inline h-4 w-4" /> Identity verified
                </p>
                <button
                  onClick={() => navigate({ to: "/dashboard/company" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-glow transition hover:scale-[1.02]"
                >
                  Continue to dashboard
                </button>
              </>
            )}
          </div>
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
