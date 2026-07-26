// Supabase authentication placeholder.
// Wire up @supabase/supabase-js once Lovable Cloud is enabled.

export type Role = "developer" | "company" | "employee";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export async function signInWithEmail(
  email: string,
  _password: string,
  role: Role,
): Promise<{ user: AuthUser | null; error: string | null }> {
  // TODO: replace with supabase.auth.signInWithPassword
  await new Promise((r) => setTimeout(r, 600));
  return { user: { id: "placeholder", email, role }, error: null };
}

export async function signUpWithEmail(
  email: string,
  _password: string,
  role: Role,
): Promise<{ user: AuthUser | null; error: string | null }> {
  // TODO: replace with supabase.auth.signUp
  await new Promise((r) => setTimeout(r, 600));
  return { user: { id: "placeholder", email, role }, error: null };
}

export async function signOut(): Promise<void> {
  // TODO: replace with supabase.auth.signOut
}
