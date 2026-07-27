import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, User as UserIcon } from "lucide-react";
import { signIn, signUp, type Role } from "@/lib/auth";

interface Props {
  role: Role;
  redirectTo: string;
  cta: string;
  accent?: "blue" | "orange";
  identifierLabel?: string;
}

export function LoginForm({ role, redirectTo, cta, accent = "blue", identifierLabel = "Email" }: Props) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    if (mode === "signup") {
      const { error, user } = await signUp(email, password, role, displayName);
      setLoading(false);
      if (error) return setError(error);
      if (!user?.email_confirmed_at && !user?.confirmed_at) {
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("signin");
        return;
      }
      navigate({ to: redirectTo });
      return;
    }
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) return setError(error);
    navigate({ to: redirectTo });
  }

  const btnClass =
    accent === "orange"
      ? "bg-gradient-accent text-accent-foreground shadow-glow"
      : "bg-gradient-primary text-primary-foreground shadow-elegant";
  const accentText = accent === "orange" ? "text-accent" : "text-primary";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Display name
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-input bg-card/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {identifierLabel}
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl border border-input bg-card/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-input bg-card/70 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-input" />
          Remember me
        </label>
        <Link to="/forgot-password" className={`font-semibold ${accentText} hover:underline`}>
          Forgot password?
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {info}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:scale-[1.01] disabled:opacity-70 ${btnClass}`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Please wait…" : mode === "signup" ? `Create ${role} account` : cta}
      </button>

      <p className="pt-1 text-center text-xs text-muted-foreground">
        {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className={`font-semibold ${accentText} hover:underline`}
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
