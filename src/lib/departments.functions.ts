import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertDeveloper } from "@/lib/companies.shared";
import {
  DEPARTMENT_COLUMNS,
  createDepartmentSchema,
  departmentIdSchema,
  listDepartmentsSchema,
  updateDepartmentSchema,
  type DepartmentRow,
} from "@/lib/departments.shared";

export type { DepartmentRow };

export const listDepartments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => listDepartmentsSchema.parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);

    const page = Math.max(1, data.page);
    const pageSize = Math.min(50, Math.max(5, data.pageSize));
    const from = (page - 1) * pageSize;

    let query = context.supabase
      .from("departments")
      .select(DEPARTMENT_COLUMNS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    const search = data.search.trim().slice(0, 100).replace(/[,()]/g, "");
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }
    if (data.companyId && data.companyId !== "all") {
      query = query.eq("company_id", data.companyId);
    }
    if (data.status === "active" || data.status === "inactive") {
      query = query.eq("status", data.status);
    }

    const { data: rows, count, error } = await query.returns<DepartmentRow[]>();
    if (error) throw new Error(error.message);

    return { rows: rows ?? [], total: count ?? 0, page, pageSize };
  });

export const listDepartmentCompanies = createServerFn({ method: "GET" })
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

export const createDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createDepartmentSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("departments")
      .insert({ ...data, created_by: context.userId })
      .select("id")
      .single();
    if (error) {
      throw new Error(
        error.code === "23505" || error.message.includes("departments_company_name_key")
          ? "A department with this name already exists for this company"
          : error.message,
      );
    }
    return { id: row.id as string };
  });

export const updateDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateDepartmentSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { id, ...department } = data;
    const { error } = await context.supabase.from("departments").update(department).eq("id", id);
    if (error) {
      throw new Error(
        error.message.includes("departments_company_name_key")
          ? "A department with this name already exists for this company"
          : error.message,
      );
    }
    return { ok: true };
  });

export const deleteDepartment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => departmentIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertDeveloper(context.supabase, context.userId);
    const { error } = await context.supabase.from("departments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
