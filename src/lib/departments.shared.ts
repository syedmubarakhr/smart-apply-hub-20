import { z } from "zod";

export interface DepartmentRow {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string;
  status: "active" | "inactive";
  created_at: string;
  companies: { name: string; code: string } | null;
}

export const DEPARTMENT_COLUMNS =
  "id,company_id,name,code,description,status,created_at,companies(name,code)";

export const DEPARTMENT_SUGGESTIONS = [
  "Recruitment",
  "HR",
  "Finance",
  "Operations",
  "Business Development",
  "Training",
  "Legal",
];

export const listDepartmentsSchema = z.object({
  search: z.string().optional().default(""),
  companyId: z.string().optional().default("all"),
  status: z.string().optional().default("all"),
  page: z.number().int().optional().default(1),
  pageSize: z.number().int().optional().default(10),
});

const baseDepartment = {
  company_id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().max(40).default(""),
  description: z.string().trim().max(500).default(""),
  status: z.enum(["active", "inactive"]).default("active"),
};

export const createDepartmentSchema = z.object(baseDepartment);

export const updateDepartmentSchema = z.object({
  id: z.string().uuid(),
  ...baseDepartment,
});

export const departmentIdSchema = z.object({ id: z.string().uuid() });
