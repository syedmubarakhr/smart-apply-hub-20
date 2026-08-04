import { Link } from "@tanstack/react-router";
import { ArrowLeft, ScanFace } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  accent?: "blue" | "orange";
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  accent = "blue",
  children,
  footer,
}: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl animate-float" />
        <div
          className="absolute -right-24 bottom-10 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-elegant">
              <ScanFace className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">SATS</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
            <div className="hidden lg:block">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent === "orange" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"}`}
              >
                {eyebrow}
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{title}</h1>
              <p className="mt-3 max-w-md text-base text-muted-foreground">{description}</p>

              <div className="mt-8 space-y-3">
                {[
                  "SOC 2 Type II, ISO 27001 & GDPR-ready infrastructure",
                  "Biometric face verification with liveness detection",
                  "Real-time analytics across every hiring pipeline",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-3 rounded-2xl glass-card p-3">
                    <div
                      className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${accent === "orange" ? "bg-accent" : "bg-primary"}`}
                    />
                    <p className="text-sm text-foreground/80">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 shadow-elegant">
              <div className="lg:hidden">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${accent === "orange" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"}`}
                >
                  {eyebrow}
                </span>
                <h1 className="mt-3 font-display text-2xl font-bold">{title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="mt-6 lg:mt-0">{children}</div>
              {footer ? (
                <div className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
