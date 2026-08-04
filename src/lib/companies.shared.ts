import { z } from "zod";

export interface CompanyRow {
  id: string;
  name: string;
  code: string;
  login_id: string;
  country: string;
  timezone: string;
  logo_url: string | null;
  status: "active" | "suspended";
  admin_name: string;
  admin_email: string;
  created_at: string;
}

export const COMPANY_COLUMNS =
  "id,name,code,login_id,country,timezone,logo_url,status,admin_name,admin_email,created_at";

export const listSchema = z.object({
  search: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  country: z.string().optional().default("all"),
  page: z.number().int().optional().default(1),
  pageSize: z.number().int().optional().default(10),
});

const baseCompany = {
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(40),
  login_id: z.string().trim().email().max(255),
  country: z.string().trim().max(80).default(""),
  timezone: z.string().trim().max(80).default("UTC"),
  logo_url: z.string().max(400_000).nullable().optional(),
  status: z.enum(["active", "suspended"]).default("active"),
  admin_name: z.string().trim().max(120).default(""),
  admin_email: z.string().trim().max(255).default(""),
};

export const createSchema = z.object({ ...baseCompany, password: z.string().min(8).max(72) });

export const updateSchema = z.object({
  id: z.string().uuid(),
  ...baseCompany,
  password: z.string().min(8).max(72).optional(),
});

export const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "suspended"]),
});

export const idSchema = z.object({ id: z.string().uuid() });

type RpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

export async function assertDeveloper(supabase: RpcClient, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "developer",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: developer role required");
}
