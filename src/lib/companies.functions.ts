import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  COMPANY_COLUMNS,
  assertDeveloper,
  createSchema,
  idSchema,
  listSchema,
  statusSchema,
  updateSchema,
  type CompanyRow,
} from "@/lib/companies.shared";

export type { CompanyRow };

export const listCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);

    const page = Math.max(1, data.page);
    const pageSize = Math.min(50, Math.max(5, data.pageSize));
    const from = (page - 1) * pageSize;

    let query = context.supabase
      .from("companies")
      .select(COMPANY_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    const search = data.search.trim().slice(0, 100).replace(/[,()]/g, "");
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,code.ilike.%${search}%,login_id.ilike.%${search}%,admin_email.ilike.%${search}%`,
      );
    }
    if (data.status === "active" || data.status === "suspended") {
      query = query.eq("status", data.status);
    }
    if (data.country && data.country !== "all") {
      query = query.eq("country", data.country);
    }

    const { data: rows, count, error } = await query.returns<CompanyRow[]>();
    if (error) throw new Error(error.message);

    return { rows: rows ?? [], total: count ?? 0, page, pageSize };
  });

export const listCompanyCountries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("companies")
      .select("country")
      .neq("country", "")
      .returns<{ country: string }[]>();
    if (error) throw new Error(error.message);
    return Array.from(new Set((data ?? []).map((r) => r.country))).sort();
  });

export const createCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { password, ...company } = data;

    const created = await supabaseAdmin.auth.admin.createUser({
      email: company.login_id,
      password,
      email_confirm: true,
      user_metadata: { role: "company", display_name: company.name },
    });
    if (created.error) throw new Error(created.error.message);

    const { data: row, error } = await supabaseAdmin
      .from("companies")
      .insert({
        ...company,
        auth_user_id: created.data.user?.id ?? null,
        created_by: context.userId,
      })
      .select("id")
      .single();

    if (error) {
      if (created.data.user?.id) await supabaseAdmin.auth.admin.deleteUser(created.data.user.id);
      throw new Error(error.message);
    }

    return { id: row.id as string };
  });

export const updateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { id, password, ...company } = data;

    const { data: existing, error: readError } = await supabaseAdmin
      .from("companies")
      .select("auth_user_id")
      .eq("id", id)
      .single();
    if (readError) throw new Error(readError.message);

    const authUserId = existing?.auth_user_id as string | null;
    if (authUserId) {
      const attrs: { email?: string; password?: string } = { email: company.login_id };
      if (password) attrs.password = password;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, attrs);
      if (error) throw new Error(error.message);
    }

    const { error } = await supabaseAdmin.from("companies").update(company).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCompanyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => statusSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("companies")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => idSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("companies")
      .select("auth_user_id")
      .eq("id", data.id)
      .single();

    const { error } = await supabaseAdmin.from("companies").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    const authUserId = existing?.auth_user_id as string | null;
    if (authUserId) await supabaseAdmin.auth.admin.deleteUser(authUserId);

    return { ok: true };
  });
