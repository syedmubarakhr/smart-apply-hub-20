import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { CameraOff, Loader2 } from "lucide-react";

export interface WebcamCaptureHandle {
  capture: () => string | null;
}

interface Props {
  className?: string;
  overlay?: React.ReactNode;
  mirrored?: boolean;
  onReady?: () => void;
  onError?: (message: string) => void;
}

/**
 * Reusable webcam preview component. Exposes a `capture()` method via ref
 * that returns a base64 JPEG data URL of the current frame (or null).
 */
export const WebcamCapture = forwardRef<WebcamCaptureHandle, Props>(function WebcamCapture(
  { className = "", overlay, mirrored = true, onReady, onError },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    capture() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return null;
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      if (mirrored) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, w, h);
      if (mirrored) ctx.restore();
      return canvas.toDataURL("image/jpeg", 0.85);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    async function start() {
      setStatus("loading");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setStatus("ready");
        onReady?.();
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Unable to access camera. Check browser permissions.";
        setErrorMsg(msg);
        setStatus("error");
        onError?.(msg);
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`relative overflow-hidden bg-black/80 ${className}`}>
      <video
        ref={videoRef}
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
      />
      <canvas ref={canvasRef} className="hidden" />
      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Starting camera…
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-background/80 p-6 text-center">
          <div className="flex max-w-xs flex-col items-center gap-2">
            <CameraOff className="h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold text-foreground">Camera unavailable</p>
            <p className="text-xs text-muted-foreground">{errorMsg}</p>
          </div>
        </div>
      )}
      {overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}
    </div>
  );
});
