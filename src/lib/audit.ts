import { supabase } from "@/integrations/supabase/client";

export type AuditEvent =
  | "face_verify_started"
  | "face_verify_success"
  | "face_verify_failed"
  | "face_verify_locked"
  | "face_verify_reset"
  | "login_success"
  | "logout";

/**
 * Placeholder audit logger. Writes to public.audit_logs (RLS: self only).
 * Failures are swallowed so audit issues never block a user flow.
 */
export async function logAudit(
  event: AuditEvent,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) return;
    await supabase.from("audit_logs").insert({
      user_id: userId,
      event,
      metadata,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (err) {
    // audit logs are best-effort placeholders
    console.warn("[audit] failed to write", event, err);
  }
}
