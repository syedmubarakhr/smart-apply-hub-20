import { z } from "zod";

export type UserStatus = "active" | "inactive";

export type FaceStatus = "not_registered" | "pending" | "approved" | "rejected" | "locked";

export const FACE_STATUS_LABEL: Record<FaceStatus, string> = {
  not_registered: "Not Registered",
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  locked: "Locked",
};

export interface ManagedUserRow {
  id: string;
  display_name: string | null;
  username: string | null;
  email: string | null;
  mobile: string;
  status: UserStatus;
  company_id: string | null;
  department_id: string | null;
  role_id: string | null;
  reporting_manager_id: string | null;
  last_login_at: string | null;
  created_at: string;
  face_locked_at: string | null;
  face_verify_attempts: number;
  company_name: string | null;
  department_name: string | null;
  role_name: string | null;
  reporting_manager_name: string | null;
  app_roles: string[];
  face_status: FaceStatus;
}

export const PROFILE_COLUMNS =
  "id,display_name,username,email,mobile,status,company_id,department_id,role_id,reporting_manager_id,last_login_at,created_at,face_locked_at,face_verify_attempts,companies(name),departments(name),roles(name)";

export const listUsersSchema = z.object({
  search: z.string().optional().default(""),
  companyId: z.string().optional().default("all"),
  departmentId: z.string().optional().default("all"),
  roleId: z.string().optional().default("all"),
  status: z.string().optional().default("all"),
  page: z.number().int().optional().default(1),
  pageSize: z.number().int().optional().default(10),
});

const baseUser = {
  display_name: z.string().trim().min(2).max(120),
  username: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-zA-Z0-9._-]+$/, "Letters, numbers, dot, dash and underscore only"),
  email: z.string().trim().email().max(255),
  mobile: z.string().trim().max(30).default(""),
  company_id: z.string().uuid({ message: "Company is required" }),
  department_id: z.string().uuid({ message: "Department is required" }),
  role_id: z.string().uuid({ message: "Role is required" }),
  reporting_manager_id: z.string().uuid().nullable().default(null),
  status: z.enum(["active", "inactive"]).default("active"),
};

export const createUserSchema = z.object({
  ...baseUser,
  password: z.string().min(8).max(72),
});

export const updateUserSchema = z.object({ id: z.string().uuid(), ...baseUser });

export const userIdSchema = z.object({ id: z.string().uuid() });

export const userStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "inactive"]),
});

export const resetPasswordSchema = z.object({
  id: z.string().uuid(),
  password: z.string().min(8).max(72),
});

export function generatePassword(length = 14): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
