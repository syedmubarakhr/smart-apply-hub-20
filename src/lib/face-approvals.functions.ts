import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertFaceApprover,
  listApprovalsSchema,
  registrationIdSchema,
  rejectSchema,
  type FaceApprovalRow,
  type FaceRegistrationImages,
  type FaceRegistrationStatus,
} from "@/lib/face-approvals.shared";

export type { FaceApprovalRow, FaceRegistrationImages, FaceRegistrationStatus };

const POSE_LABELS: { key: string; label: string }[] = [
  { key: "image_front", label: "Front" },
  { key: "image_left", label: "Left" },
  { key: "image_right", label: "Right" },
  { key: "image_up", label: "Up" },
  { key: "image_smile", label: "Smile" },
];

export const listFaceRegistrations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listApprovalsSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertFaceApprover(supabase, userId);

    const page = Math.max(1, data.page);
    const pageSize = Math.min(50, Math.max(5, data.pageSize));
    const from = (page - 1) * pageSize;

    let query = supabase
      .from("face_registrations")
      .select("id,user_id,status,created_at,reviewed_at,reviewed_by,image_front", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (data.status !== "all") query = query.eq("status", data.status);

    const { data: rows, error, count } = await query;
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.user_id);
    const profiles = ids.length
      ? ((
          await supabase
            .from("profiles")
            .select("id,email,display_name,username,company_id,department_id")
            .in("id", ids)
        ).data ?? [])
      : [];

    const companyIds = [...new Set(profiles.map((p) => p.company_id).filter(Boolean))] as string[];
    const departmentIds = [
      ...new Set(profiles.map((p) => p.department_id).filter(Boolean)),
    ] as string[];

    const companies = companyIds.length
      ? ((await supabase.from("companies").select("id,name").in("id", companyIds)).data ?? [])
      : [];
    const departments = departmentIds.length
      ? ((await supabase.from("departments").select("id,name").in("id", departmentIds)).data ?? [])
      : [];

    const items: FaceApprovalRow[] = (rows ?? []).map((r) => {
      const profile = profiles.find((p) => p.id === r.user_id);
      const email = profile?.email ?? "";
      return {
        id: r.id,
        user_id: r.user_id,
        status: r.status as FaceRegistrationStatus,
        created_at: r.created_at,
        reviewed_at: r.reviewed_at,
        reviewed_by: r.reviewed_by,
        image_front: r.image_front,
        display_name: profile?.display_name ?? email.split("@")[0] ?? "Employee",
        username: profile?.username ?? email,
        email,
        company_name: companies.find((c) => c.id === profile?.company_id)?.name ?? null,
        department_name: departments.find((d) => d.id === profile?.department_id)?.name ?? null,
      };
    });

    // Search is applied on the resolved identity fields.
    const search = data.search.trim().toLowerCase();
    const filtered = search
      ? items.filter((i) =>
          [i.display_name, i.username, i.email, i.company_name ?? "", i.department_name ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(search),
        )
      : items;

    return { items: filtered, total: count ?? filtered.length, page, pageSize };
  });

export const getFaceRegistrationImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => registrationIdSchema.parse(d))
  .handler(async ({ data, context }): Promise<FaceRegistrationImages> => {
    const { supabase, userId } = context;
    await assertFaceApprover(supabase, userId);

    const { data: row, error } = await supabase
      .from("face_registrations")
      .select("id,user_id,status,image_front,image_left,image_right,image_up,image_smile")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Registration not found");

    return {
      id: row.id,
      user_id: row.user_id,
      status: row.status as FaceRegistrationStatus,
      images: POSE_LABELS.map((p) => ({
        key: p.key,
        label: p.label,
        payload: (row as unknown as Record<string, string>)[p.key],
      })),
    };
  });

async function review(
  supabase: Parameters<typeof assertFaceApprover>[0],
  reviewerId: string,
  registrationId: string,
  status: "approved" | "rejected",
  reason: string,
) {
  await assertFaceApprover(supabase, reviewerId);

  const reviewedAt = new Date().toISOString();
  const { data: row, error } = await supabase
    .from("face_registrations")
    .update({ status, reviewed_by: reviewerId, reviewed_at: reviewedAt })
    .eq("id", registrationId)
    .select("id,user_id,status,reviewed_at")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Registration not found");

  // A rejected employee re-registers from scratch, so clear any lock/attempts.
  if (status === "rejected") {
    await supabase
      .from("profiles")
      .update({ face_verify_attempts: 0, face_locked_at: null })
      .eq("id", row.user_id);
  }

  await supabase.from("audit_logs").insert({
    user_id: reviewerId,
    event: status === "approved" ? "face_registration_approved" : "face_registration_rejected",
    metadata: {
      registration_id: row.id,
      employee_id: row.user_id,
      reviewed_at: reviewedAt,
      ...(reason ? { reason } : {}),
    } as never,
  });

  return { id: row.id, user_id: row.user_id, status, reviewed_at: reviewedAt };
}

export const approveFaceRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => registrationIdSchema.parse(d))
  .handler(({ data, context }) =>
    review(context.supabase, context.userId, data.id, "approved", ""),
  );

export const rejectFaceRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => rejectSchema.parse(d))
  .handler(({ data, context }) =>
    review(context.supabase, context.userId, data.id, "rejected", data.reason),
  );
