import { z } from "zod";

// ============================================================
// DEPARTMENT SCHEMAS
// ============================================================

// Base department schema
export const departmentSchema = z.object({
  id: z.string().uuid("Invalid department ID"),
  department_name: z.string()
    .min(2, "Department name must be at least 2 characters")
    .max(255, "Department name must be less than 255 characters")
    .regex(/^[A-Za-z\s&]+$/, "Department name can only contain letters, spaces, and ampersand"),
  department_code: z.string()
    .min(2, "Department code must be at least 2 characters")
    .max(20, "Department code must be less than 20 characters")
    .regex(/^[A-Z]{2,6}$/, "Department code must be 2-6 uppercase letters (e.g., CS, COMP, MATH)"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Department creation schema (without ID and timestamps)
export const createDepartmentSchema = departmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Department update schema (all fields optional except ID)
export const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  id: z.string().uuid("Invalid department ID"),
});

// Department search/filter schema
export const departmentSearchSchema = z.object({
  is_active: z.boolean().optional(),
  search: z.string().max(100, "Search term too long").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// Department head assignment schema
export const departmentHeadSchema = z.object({
  department_id: z.string().uuid("Invalid department ID"),
  profile_id: z.string().uuid("Invalid profile ID"),
  start_date: z.string().datetime("Invalid start date").optional(),
  end_date: z.string().datetime("Invalid end date").optional(),
  is_active: z.boolean().default(true),
  appointed_by: z.string().uuid("Invalid appointed_by ID").optional(),
}).strict();

// Department head creation schema
export const createDepartmentHeadSchema = departmentHeadSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Department head update schema
export const updateDepartmentHeadSchema = createDepartmentHeadSchema.partial().extend({
  id: z.string().uuid("Invalid department head ID"),
});

// Department head search schema
export const departmentHeadSearchSchema = z.object({
  department_id: z.string().uuid("Invalid department ID").optional(),
  profile_id: z.string().uuid("Invalid profile ID").optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// ============================================================
// TYPES
// ============================================================

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DepartmentSearchInput = z.infer<typeof departmentSearchSchema>;
export type DepartmentHeadInput = z.infer<typeof departmentHeadSchema>;
export type CreateDepartmentHeadInput = z.infer<typeof createDepartmentHeadSchema>;
export type UpdateDepartmentHeadInput = z.infer<typeof updateDepartmentHeadSchema>;
export type DepartmentHeadSearchInput = z.infer<typeof departmentHeadSearchSchema>; 