import { z } from "zod";

export const PERMISSION_ACTIONS = [
  { key: "can_view", label: "View" },
  { key: "can_add", label: "Add" },
  { key: "can_edit", label: "Edit" },
  { key: "can_delete", label: "Delete" },
  { key: "can_approve", label: "Approve" },
  { key: "can_export", label: "Export" },
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]["key"];

export const PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard", group: "Platform" },
  { key: "companies", label: "Companies", group: "Platform" },
  { key: "users", label: "Users", group: "Platform" },
  { key: "roles", label: "Roles & Permissions", group: "Access Control" },
  { key: "departments", label: "Departments", group: "Access Control" },
  { key: "holidays", label: "Holiday Management", group: "Access Control" },
  { key: "candidates", label: "Candidates", group: "Recruitment" },
  { key: "jobs", label: "Job Requisitions", group: "Recruitment" },
  { key: "interviews", label: "Interviews", group: "Recruitment" },
  { key: "offers", label: "Offers", group: "Recruitment" },
  { key: "attendance", label: "Attendance", group: "Workforce" },
  { key: "ai_engine", label: "AI Engine", group: "System" },
  { key: "reports", label: "Reports", group: "System" },
  { key: "audit_logs", label: "Audit Logs", group: "System" },
  { key: "settings", label: "Settings", group: "System" },
] as const;

export const MODULE_KEYS = PERMISSION_MODULES.map((m) => m.key) as string[];

export const ROLE_SUGGESTIONS = [
  "Super Admin",
  "HR Lead",
  "Recruiter",
  "Interviewer",
  "Hiring Manager",
  "Finance Officer",
  "Auditor",
];

export interface RolePermissionRow {
  module: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_export: boolean;
}

export interface RoleRow {
  id: string;
  company_id: string | null;
  name: string;
  code: string;
  description: string;
  scope: "platform" | "company";
  status: "active" | "inactive";
  created_at: string;
  companies: { name: string; code: string } | null;
  role_permissions: RolePermissionRow[];
}

export const ROLE_COLUMNS =
  "id,company_id,name,code,description,scope,status,created_at,companies(name,code),role_permissions(module,can_view,can_add,can_edit,can_delete,can_approve,can_export)";

export const listRolesSchema = z.object({
  search: z.string().optional().default(""),
  companyId: z.string().optional().default("all"),
  scope: z.string().optional().default("all"),
  status: z.string().optional().default("all"),
  page: z.number().int().optional().default(1),
  pageSize: z.number().int().optional().default(10),
});

export const permissionSchema = z.object({
  module: z.string().refine((m) => MODULE_KEYS.includes(m), "Unknown module"),
  can_view: z.boolean().default(false),
  can_add: z.boolean().default(false),
  can_edit: z.boolean().default(false),
  can_delete: z.boolean().default(false),
  can_approve: z.boolean().default(false),
  can_export: z.boolean().default(false),
});

const baseRole = {
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().max(40).default(""),
  description: z.string().trim().max(500).default(""),
  scope: z.enum(["platform", "company"]).default("company"),
  company_id: z.string().uuid().nullable().default(null),
  status: z.enum(["active", "inactive"]).default("active"),
  permissions: z.array(permissionSchema).max(PERMISSION_MODULES.length).default([]),
};

export const createRoleSchema = z
  .object(baseRole)
  .refine((v) => v.scope === "platform" || !!v.company_id, {
    message: "Select a company for a company-scoped role",
    path: ["company_id"],
  });

export const updateRoleSchema = z
  .object({ id: z.string().uuid(), ...baseRole })
  .refine((v) => v.scope === "platform" || !!v.company_id, {
    message: "Select a company for a company-scoped role",
    path: ["company_id"],
  });

export const roleIdSchema = z.object({ id: z.string().uuid() });

export function emptyPermissionMatrix(): Record<string, RolePermissionRow> {
  const matrix: Record<string, RolePermissionRow> = {};
  for (const m of PERMISSION_MODULES) {
    matrix[m.key] = {
      module: m.key,
      can_view: false,
      can_add: false,
      can_edit: false,
      can_delete: false,
      can_approve: false,
      can_export: false,
    };
  }
  return matrix;
}

export function countGrants(permissions: RolePermissionRow[]): number {
  return permissions.reduce(
    (total, p) => total + PERMISSION_ACTIONS.filter((a) => p[a.key]).length,
    0,
  );
}
