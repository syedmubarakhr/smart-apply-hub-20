import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * First-login gate for employees: routes to registration, approval waiting,
 * lockout, or live verification depending on biometric enrollment state.
 */
export const Route = createFileRoute("/_authenticated/employee")({
  ssr: false,
  beforeLoad: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) throw redirect({ to: "/login/employee" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("face_locked_at")
      .eq("id", uid)
      .maybeSingle();
    if (profile?.face_locked_at) throw redirect({ to: "/face/locked" });

    const { data: registration } = await supabase
      .from("face_registrations")
      .select("status")
      .eq("user_id", uid)
      .maybeSingle();

    if (!registration) throw redirect({ to: "/face/register" });
    if (registration.status === "rejected") throw redirect({ to: "/face/register" });
    if (registration.status !== "approved") throw redirect({ to: "/face/pending" });
    throw redirect({ to: "/face/verify" });
  },
  component: () => (
    <div className="grid min-h-screen place-items-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});
