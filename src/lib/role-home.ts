import { supabase } from "@/integrations/supabase/client";

export type AppRole = "developer" | "company" | "hr_lead" | "employee";

/** Resolves the signed-in user's role from public.user_roles (RLS: self only). */
export async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  return (data?.role as AppRole | undefined) ?? null;
}

/** Landing destination for a role after authentication. */
export function homeForRole(role: AppRole | null): string {
  switch (role) {
    case "developer":
      return "/dashboard/developer";
    case "company":
      return "/dashboard/company";
    case "hr_lead":
      return "/dashboard/hr-lead";
    case "employee":
      return "/employee";
    default:
      return "/";
  }
}

export async function resolveHome(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return "/";
  return homeForRole(await fetchRole(uid));
}
