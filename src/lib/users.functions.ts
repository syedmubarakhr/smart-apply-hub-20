import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertDeveloper } from "@/lib/companies.shared";
import {
  PROFILE_COLUMNS,
  createUserSchema,
  listUsersSchema,
  resetPasswordSchema,
  updateUserSchema,
  userIdSchema,
  userStatusSchema,
  type FaceStatus,
  type ManagedUserRow,
} from "@/lib/users.shared";

export type { ManagedUserRow };

type AuditAction =
  | "user_created"
  | "user_updated"
  | "user_activated"
  | "user_deactivated"
  | "user_password_reset"
  | "user_face_reset"
  | "user_account_unlocked"
  | "user_deleted"
  | "user_role_changed"
  | "user_department_changed";

interface RawProfile {
  id: string;
  display_name: string | null;
  username: string | null;
  email: string | null;
  mobile: string;
  status: "active" | "inactive";
  company_id: string | null;
  department_id: string | null;
  role_id: string | null;
  reporting_manager_id: string | null;
  last_login_at: string | null;
  created_at: string;
  face_locked_at: string | null;
  face_verify_attempts: number;
  companies: { name: string } | null;
  departments: { name: string } | null;
  roles: { name: string } | null;
}

/** Writes an audit trail entry: actor, company, target user, action, timestamp. */
async function writeAudit(
  actorId: string,
  action: AuditAction,
  meta: { targetUserId?: string; companyId?: string | null; [k: string]: unknown },
) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      user_id: actorId,
      event: action,
      metadata: { actor_id: actorId, ...meta } as never,
    });
  } catch (err) {
    console.warn("[audit] failed", action, err);
  }
}

function faceStatusFor(
  profile: { face_locked_at: string | null },
  registration: { status: string } | undefined,
): FaceStatus {
  if (profile.face_locked_at) return "locked";
  if (!registration) return "not_registered";
  if (registration.status === "approved") return "approved";
  if (registration.status === "rejected") return "rejected";
  return "pending";
}

/** app_role granted alongside the company role assignment. */
function appRoleFor(roleName: string): "hr_lead" | "employee" {
  return roleName.toLowerCase().includes("hr lead") ? "hr_lead" : "employee";
}

export const listManagedUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listUsersSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);

    const page = Math.max(1, data.page);
    const pageSize = Math.min(50, Math.max(5, data.pageSize));
    const from = (page - 1) * pageSize;

    let query = context.supabase
      .from("profiles")
      .select(PROFILE_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    const search = data.search.trim().slice(0, 100).replace(/[,()]/g, "");
    if (search) {
      query = query.or(
        `display_name.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`,
      );
    }
    if (data.companyId !== "all") query = query.eq("company_id", data.companyId);
    if (data.departmentId !== "all") query = query.eq("department_id", data.departmentId);
    if (data.roleId !== "all") query = query.eq("role_id", data.roleId);
    if (data.status === "active" || data.status === "inactive")
      query = query.eq("status", data.status);

    const { data: rows, count, error } = await query.returns<RawProfile[]>();
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.id);
    const managerIds = Array.from(
      new Set((rows ?? []).map((r) => r.reporting_manager_id).filter((v): v is string => !!v)),
    );

    const [regs, appRoles, managers] = await Promise.all([
      ids.length
        ? context.supabase
            .from("face_registrations")
            .select("user_id,status,created_at")
            .in("user_id", ids)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      ids.length
        ? context.supabase.from("user_roles").select("user_id,role").in("user_id", ids)
        : Promise.resolve({ data: [], error: null }),
      managerIds.length
        ? context.supabase.from("profiles").select("id,display_name").in("id", managerIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const latestReg = new Map<string, { status: string }>();
    for (const r of (regs.data ?? []) as { user_id: string; status: string }[]) {
      if (!latestReg.has(r.user_id)) latestReg.set(r.user_id, { status: r.status });
    }
    const roleMap = new Map<string, string[]>();
    for (const r of (appRoles.data ?? []) as { user_id: string; role: string }[]) {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    }
    const managerMap = new Map<string, string | null>();
    for (const m of (managers.data ?? []) as { id: string; display_name: string | null }[]) {
      managerMap.set(m.id, m.display_name);
    }

    const mapped: ManagedUserRow[] = (rows ?? []).map((r) => ({
      id: r.id,
      display_name: r.display_name,
      username: r.username,
      email: r.email,
      mobile: r.mobile,
      status: r.status,
      company_id: r.company_id,
      department_id: r.department_id,
      role_id: r.role_id,
      reporting_manager_id: r.reporting_manager_id,
      last_login_at: r.last_login_at,
      created_at: r.created_at,
      face_locked_at: r.face_locked_at,
      face_verify_attempts: r.face_verify_attempts,
      company_name: r.companies?.name ?? null,
      department_name: r.departments?.name ?? null,
      role_name: r.roles?.name ?? null,
      reporting_manager_name: r.reporting_manager_id
        ? (managerMap.get(r.reporting_manager_id) ?? null)
        : null,
      app_roles: roleMap.get(r.id) ?? [],
      face_status: faceStatusFor(r, latestReg.get(r.id)),
    }));

    return { rows: mapped, total: count ?? 0, page, pageSize };
  });

/** Companies, their departments and their assignable roles — for filters and the form. */
export const listUserDirectory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertDeveloper(context.supabase, context.userId);

    const [companies, departments, roles] = await Promise.all([
      context.supabase
        .from("companies")
        .select("id,name,code,status")
        .order("name", { ascending: true }),
      context.supabase
        .from("departments")
        .select("id,company_id,name,status")
        .order("name", { ascending: true }),
      context.supabase
        .from("roles")
        .select("id,company_id,name,scope,status")
        .order("name", { ascending: true }),
    ]);

    const firstError = companies.error ?? departments.error ?? roles.error;
    if (firstError) throw new Error(firstError.message);

    return {
      companies: companies.data ?? [],
      departments: departments.data ?? [],
      roles: roles.data ?? [],
    };
  });

/** Employees belonging to a company — reporting-manager options. */
export const listCompanyMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ({ companyId: String((d as { companyId?: string })?.companyId ?? "") }))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    if (!data.companyId) return [];
    const { data: rows, error } = await context.supabase
      .from("profiles")
      .select("id,display_name,username")
      .eq("company_id", data.companyId)
      .order("display_name", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Validates that department and role belong to the selected company. */
async function assertTenantIntegrity(
  supabase: Parameters<typeof assertDeveloper>[0],
  companyId: string,
  departmentId: string,
  roleId: string,
) {
  const [dept, role] = await Promise.all([
    supabase.from("departments").select("company_id").eq("id", departmentId).maybeSingle(),
    supabase.from("roles").select("company_id,scope,name").eq("id", roleId).maybeSingle(),
  ]);
  if (dept.error) throw new Error(dept.error.message);
  if (role.error) throw new Error(role.error.message);
  if (!dept.data) throw new Error("Department not found");
  if (!role.data) throw new Error("Role not found");
  if (dept.data.company_id !== companyId)
    throw new Error("Department does not belong to the selected company");
  const roleCompany = role.data.company_id as string | null;
  if (roleCompany && roleCompany !== companyId)
    throw new Error("Role is not available for the selected company");
  return { roleName: role.data.name as string };
}

export const createManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createUserSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { roleName } = await assertTenantIntegrity(
      context.supabase,
      data.company_id,
      data.department_id,
      data.role_id,
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { password, ...profile } = data;
    const appRole = appRoleFor(roleName);

    const created = await supabaseAdmin.auth.admin.createUser({
      email: profile.email,
      password,
      email_confirm: true,
      user_metadata: {
        role: appRole,
        display_name: profile.display_name,
        username: profile.username,
      },
    });
    if (created.error) throw new Error(created.error.message);
    const authUserId = created.data.user?.id;
    if (!authUserId) throw new Error("Could not create the authentication account");

    const { error } = await supabaseAdmin.from("profiles").upsert(
      {
        id: authUserId,
        email: profile.email,
        display_name: profile.display_name,
        username: profile.username,
        mobile: profile.mobile,
        status: profile.status,
        company_id: profile.company_id,
        department_id: profile.department_id,
        role_id: profile.role_id,
        reporting_manager_id: profile.reporting_manager_id,
      },
      { onConflict: "id" },
    );
    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      throw new Error(
        error.message.includes("profiles_username_unique")
          ? "This username is already taken"
          : error.message,
      );
    }

    await supabaseAdmin.from("user_roles").delete().eq("user_id", authUserId);
    await supabaseAdmin.from("user_roles").insert({ user_id: authUserId, role: appRole });

    if (profile.status === "inactive") {
      await supabaseAdmin.auth.admin.updateUserById(authUserId, { ban_duration: "876000h" });
    }

    await writeAudit(context.userId, "user_created", {
      targetUserId: authUserId,
      companyId: profile.company_id,
      departmentId: profile.department_id,
      roleId: profile.role_id,
      appRole,
    });

    return { id: authUserId };
  });

export const updateManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateUserSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { roleName } = await assertTenantIntegrity(
      context.supabase,
      data.company_id,
      data.department_id,
      data.role_id,
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { id, ...profile } = data;
    if (id === context.userId) throw new Error("Use your own profile settings to edit your account");

    const { data: before, error: beforeError } = await supabaseAdmin
      .from("profiles")
      .select("role_id,department_id,company_id,status,email")
      .eq("id", id)
      .maybeSingle();
    if (beforeError) throw new Error(beforeError.message);
    if (!before) throw new Error("User not found");
    if (profile.reporting_manager_id === id)
      throw new Error("A user cannot report to themselves");

    const appRole = appRoleFor(roleName);

    const { error } = await supabaseAdmin.from("profiles").update(profile).eq("id", id);
    if (error) {
      throw new Error(
        error.message.includes("profiles_username_unique")
          ? "This username is already taken"
          : error.message,
      );
    }

    if (before.email !== profile.email) {
      await supabaseAdmin.auth.admin.updateUserById(id, { email: profile.email });
    }

    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", id)
      .in("role", ["employee", "hr_lead"]);
    await supabaseAdmin.from("user_roles").insert({ user_id: id, role: appRole });

    if (before.status !== profile.status) {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: profile.status === "inactive" ? "876000h" : "none",
      });
    }

    await writeAudit(context.userId, "user_updated", {
      targetUserId: id,
      companyId: profile.company_id,
    });
    if (before.role_id !== profile.role_id) {
      await writeAudit(context.userId, "user_role_changed", {
        targetUserId: id,
        companyId: profile.company_id,
        from: before.role_id,
        to: profile.role_id,
      });
    }
    if (before.department_id !== profile.department_id) {
      await writeAudit(context.userId, "user_department_changed", {
        targetUserId: id,
        companyId: profile.company_id,
        from: before.department_id,
        to: profile.department_id,
      });
    }

    return { ok: true };
  });

export const setManagedUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userStatusSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    if (data.id === context.userId) throw new Error("You cannot change your own status");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("company_id")
      .maybeSingle();
    if (error) throw new Error(error.message);

    await supabaseAdmin.auth.admin.updateUserById(data.id, {
      ban_duration: data.status === "inactive" ? "876000h" : "none",
    });

    await writeAudit(
      context.userId,
      data.status === "active" ? "user_activated" : "user_deactivated",
      { targetUserId: data.id, companyId: row?.company_id ?? null },
    );
    return { ok: true };
  });

export const resetManagedUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resetPasswordSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.id, {
      password: data.password,
    });
    if (error) throw new Error(error.message);

    await writeAudit(context.userId, "user_password_reset", { targetUserId: data.id });
    return { ok: true };
  });

/** Clears the face enrolment so the employee re-registers and HR Lead re-approves. */
export const resetManagedUserFace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const del = await supabaseAdmin.from("face_registrations").delete().eq("user_id", data.id);
    if (del.error) throw new Error(del.error.message);

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ face_verify_attempts: 0, face_locked_at: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await writeAudit(context.userId, "user_face_reset", { targetUserId: data.id });
    return { ok: true };
  });

export const unlockManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ face_verify_attempts: 0, face_locked_at: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    await writeAudit(context.userId, "user_account_unlocked", { targetUserId: data.id });
    return { ok: true };
  });

export const deleteManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => userIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    if (data.id === context.userId) throw new Error("You cannot delete your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("company_id,email")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);

    await writeAudit(context.userId, "user_deleted", {
      targetUserId: data.id,
      companyId: row?.company_id ?? null,
      email: row?.email ?? null,
    });
    return { ok: true };
  });
