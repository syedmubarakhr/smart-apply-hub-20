import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertDeveloper } from "@/lib/companies.shared";
import {
  ROLE_COLUMNS,
  createRoleSchema,
  listRolesSchema,
  roleIdSchema,
  updateRoleSchema,
  type RolePermissionRow,
  type RoleRow,
} from "@/lib/roles.shared";

export type { RoleRow, RolePermissionRow };

function meaningful(permissions: RolePermissionRow[]) {
  return permissions.filter(
    (p) => p.can_view || p.can_add || p.can_edit || p.can_delete || p.can_approve || p.can_export,
  );
}

export const listRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listRolesSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);

    const page = Math.max(1, data.page);
    const pageSize = Math.min(50, Math.max(5, data.pageSize));
    const from = (page - 1) * pageSize;

    let query = context.supabase
      .from("roles")
      .select(ROLE_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    const search = data.search.trim().slice(0, 100).replace(/[,()]/g, "");
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }
    if (data.companyId && data.companyId !== "all") {
      query = query.eq("company_id", data.companyId);
    }
    if (data.scope === "platform" || data.scope === "company") {
      query = query.eq("scope", data.scope);
    }
    if (data.status === "active" || data.status === "inactive") {
      query = query.eq("status", data.status);
    }

    const { data: rows, count, error } = await query.returns<RoleRow[]>();
    if (error) throw new Error(error.message);

    return { rows: rows ?? [], total: count ?? 0, page, pageSize };
  });

export const listRoleCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("companies")
      .select("id,name,code")
      .order("name", { ascending: true })
      .returns<{ id: string; name: string; code: string }[]>();
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createRoleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { permissions, ...role } = data;

    const { data: row, error } = await context.supabase
      .from("roles")
      .insert({
        ...role,
        company_id: role.scope === "platform" ? null : role.company_id,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) {
      throw new Error(
        error.code === "23505" || error.message.includes("roles_scope_name_key")
          ? "A role with this name already exists in this scope"
          : error.message,
      );
    }

    const grants = meaningful(permissions);
    if (grants.length > 0) {
      const { error: permError } = await context.supabase
        .from("role_permissions")
        .insert(grants.map((p) => ({ ...p, role_id: row.id as string })));
      if (permError) throw new Error(permError.message);
    }

    return { id: row.id as string };
  });

export const updateRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateRoleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { id, permissions, ...role } = data;

    const { error } = await context.supabase
      .from("roles")
      .update({ ...role, company_id: role.scope === "platform" ? null : role.company_id })
      .eq("id", id);
    if (error) {
      throw new Error(
        error.message.includes("roles_scope_name_key")
          ? "A role with this name already exists in this scope"
          : error.message,
      );
    }

    const { error: clearError } = await context.supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", id);
    if (clearError) throw new Error(clearError.message);

    const grants = meaningful(permissions);
    if (grants.length > 0) {
      const { error: permError } = await context.supabase
        .from("role_permissions")
        .insert(grants.map((p) => ({ ...p, role_id: id })));
      if (permError) throw new Error(permError.message);
    }

    return { ok: true };
  });

export const deleteRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => roleIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { error } = await context.supabase.from("roles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
