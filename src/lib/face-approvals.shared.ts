import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

export type FaceRegistrationStatus = "pending" | "approved" | "rejected";

export interface FaceApprovalRow {
  id: string;
  user_id: string;
  status: FaceRegistrationStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  /** Encrypted front capture, used as the employee thumbnail. */
  image_front: string;
  display_name: string;
  username: string;
  email: string;
  company_name: string | null;
  department_name: string | null;
}

export interface FaceRegistrationImages {
  id: string;
  user_id: string;
  status: FaceRegistrationStatus;
  images: { key: string; label: string; payload: string }[];
}

export const listApprovalsSchema = z.object({
  search: z.string().optional().default(""),
  status: z.enum(["pending", "approved", "rejected", "all"]).optional().default("pending"),
  page: z.number().int().optional().default(1),
  pageSize: z.number().int().optional().default(10),
});

export const registrationIdSchema = z.object({ id: z.string().uuid() });

export const rejectSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().trim().max(300).optional().default(""),
});

/** HR Lead (or developer) gate for every approval-side server function. */
export async function assertFaceApprover(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("is_face_approver", { _user_id: userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: HR Lead role required");
}
