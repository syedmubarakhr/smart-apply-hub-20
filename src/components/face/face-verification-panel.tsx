import { useRef, useState } from "react";
import { CheckCircle2, Loader2, ScanFace, ShieldAlert, ShieldCheck } from "lucide-react";
import { WebcamCapture, type WebcamCaptureHandle } from "@/components/webcam/webcam-capture";

interface Props {
  attemptsRemaining: number;
  onVerified: (capture: string) => void;
  onFailed: () => void;
  /**
   * Simulated match probability [0..1]. Real face-matching model wires in later;
   * for now we placeholder with a deterministic pseudo-check.
   */
  matchThreshold?: number;
}

type Phase = "idle" | "scanning" | "success" | "failed";

export function FaceVerificationPanel({
  attemptsRemaining,
  onVerified,
  onFailed,
  matchThreshold = 0.6,
}: Props) {
  const webcamRef = useRef<WebcamCaptureHandle | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);

  function runVerification() {
    const frame = webcamRef.current?.capture();
    if (!frame) {
      setMessage("Camera isn't ready yet — please wait a moment.");
      return;
    }
    setMessage(null);
    setPhase("scanning");
    // Placeholder verification: simulate model inference latency.
    // TODO: replace with real face-embedding compare against stored template.
    window.setTimeout(() => {
      const score = Math.random();
      if (score >= 1 - matchThreshold) {
        setPhase("success");
        onVerified(frame);
      } else {
        setPhase("failed");
        setMessage("We couldn't match your face. Please try again.");
        onFailed();
      }
    }, 1600);
  }

  const scanning = phase === "scanning";
  const succeeded = phase === "success";

  return (
    <div className="glass-card rounded-3xl p-6 shadow-elegant">
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full border-4 border-primary/20">
        <WebcamCapture
          ref={webcamRef}
          className="h-full w-full rounded-full"
          overlay={
            <>
              {scanning && (
                <div className="absolute inset-x-0 top-0 h-1 origin-left animate-[shimmer_1.8s_linear_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}
              {scanning && (
                <>
                  <div className="absolute inset-0 rounded-full ring-2 ring-primary/40 animate-pulse-ring" />
                  <div
                    className="absolute inset-0 rounded-full ring-2 ring-accent/40 animate-pulse-ring"
                    style={{ animationDelay: "0.6s" }}
                  />
                </>
              )}
              {succeeded && (
                <div className="absolute inset-0 grid place-items-center bg-primary/40 backdrop-blur-sm">
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-primary shadow-elegant">
                    <CheckCircle2 className="h-14 w-14 text-primary-foreground" />
                  </div>
                </div>
              )}
            </>
          }
        />
      </div>

      <div className="mt-6 text-center">
        {message && (
          <div
            className={`mx-auto mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              phase === "failed"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" /> {message}
          </div>
        )}
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attempts remaining: <span className="text-foreground">{attemptsRemaining}</span>
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {!succeeded && (
            <button
              onClick={runVerification}
              disabled={scanning || attemptsRemaining <= 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.02] disabled:opacity-70"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  <ScanFace className="h-4 w-4" />{" "}
                  {phase === "failed" ? "Try again" : "Start verification"}
                </>
              )}
            </button>
          )}
          {succeeded && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" /> Identity verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
