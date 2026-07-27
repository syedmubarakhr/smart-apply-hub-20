import { supabase } from "@/integrations/supabase/client";

export type Role = "developer" | "company" | "employee";

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data.user, error: error?.message ?? null };
}

export async function signUp(email: string, password: string, role: Role, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: { role, display_name: displayName ?? email.split("@")[0] },
    },
  });
  return { user: data.user, error: error?.message ?? null };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error?.message ?? null };
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message ?? null };
}
