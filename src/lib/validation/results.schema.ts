import { z } from "zod";

// ============================================================
// RESULT SCHEMAS
// ============================================================

// Base result schema
export const resultSchema = z.object({
  id: z.string().uuid("Invalid result ID"),
  student_id: z.string().uuid("Invalid student ID"),
  course_id: z.string().uuid("Invalid course ID"),
  session_id: z.string().uuid("Invalid session ID"),
  score: z.number()
    .int("Score must be an integer")
    .min(0, "Score must be at least 0")
    .max(100, "Score must be at most 100"),
  grade: z.string()
    .min(1, "Grade must be at least 1 character")
    .max(5, "Grade must be less than 5 characters")
    .regex(/^[A-F][+-]?$/, "Grade must be A, B, C, D, F with optional + or -")
    .optional(),
  grade_point: z.number()
    .min(0, "Grade point must be at least 0")
    .max(5, "Grade point must be at most 5")
    .multipleOf(0.01, "Grade point must have at most 2 decimal places")
    .optional(),
  policy_version: z.number()
    .int("Policy version must be an integer")
    .min(1, "Policy version must be at least 1")
    .optional(),
  submitted_by: z.string().uuid("Invalid submitted_by ID"),
  status: z.enum(["pending", "approved", "rejected"], {
    errorMap: () => ({ message: "Status must be pending, approved, or rejected" })
  }).default("pending"),
  approved_by: z.string().uuid("Invalid approved_by ID").optional(),
  approved_at: z.string().datetime("Invalid approved_at timestamp").optional(),
  remarks: z.string()
    .max(500, "Remarks must be less than 500 characters")
    .optional(),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Result creation schema (without ID and timestamps)
export const createResultSchema = resultSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Result update schema (all fields optional except ID)
export const updateResultSchema = createResultSchema.partial().extend({
  id: z.string().uuid("Invalid result ID"),
});

// Result search/filter schema
export const resultSearchSchema = z.object({
  student_id: z.string().uuid("Invalid student ID").optional(),
  course_id: z.string().uuid("Invalid course ID").optional(),
  session_id: z.string().uuid("Invalid session ID").optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  submitted_by: z.string().uuid("Invalid submitted_by ID").optional(),
  approved_by: z.string().uuid("Invalid approved_by ID").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// Bulk result creation schema
export const bulkResultSchema = z.object({
  results: z.array(createResultSchema)
    .min(1, "At least one result is required")
    .max(1000, "Maximum 1000 results can be created at once"),
}).strict();

// Result import/export schema for CSV/Excel
export const resultImportSchema = z.object({
  matric_number: z.string()
    .min(5, "Matric number must be at least 5 characters")
    .max(50, "Matric number must be less than 50 characters"),
  course_code: z.string()
    .min(3, "Course code must be at least 3 characters")
    .max(20, "Course code must be less than 20 characters"),
  score: z.number()
    .int("Score must be an integer")
    .min(0, "Score must be at least 0")
    .max(100, "Score must be at most 100"),
  grade: z.string()
    .min(1, "Grade must be at least 1 character")
    .max(5, "Grade must be less than 5 characters")
    .regex(/^[A-F][+-]?$/, "Grade must be A, B, C, D, F with optional + or -")
    .optional(),
  grade_point: z.number()
    .min(0, "Grade point must be at least 0")
    .max(5, "Grade point must be at most 5")
    .multipleOf(0.01, "Grade point must have at most 2 decimal places")
    .optional(),
  remarks: z.string().optional(),
}).strict();

// Bulk result import schema
export const bulkResultImportSchema = z.object({
  results: z.array(resultImportSchema)
    .min(1, "At least one result is required")
    .max(1000, "Maximum 1000 results can be imported at once"),
  session_name: z.string()
    .min(4, "Session name must be at least 4 characters")
    .max(20, "Session name must be less than 20 characters"),
  student_mapping: z.record(z.string(), z.string().uuid()).optional(), // matric_number -> student_id
  course_mapping: z.record(z.string(), z.string().uuid()).optional(), // course_code -> course_id
  session_mapping: z.record(z.string(), z.string().uuid()).optional(), // session_name -> session_id
}).strict();

// Result approval schema
export const resultApprovalSchema = z.object({
  result_id: z.string().uuid("Invalid result ID"),
  status: z.enum(["approved", "rejected"], {
    errorMap: () => ({ message: "Status must be approved or rejected" })
  }),
  remarks: z.string()
    .max(500, "Remarks must be less than 500 characters")
    .optional(),
}).strict();

// Bulk result approval schema
export const bulkResultApprovalSchema = z.object({
  results: z.array(z.object({
    result_id: z.string().uuid("Invalid result ID"),
    status: z.enum(["approved", "rejected"]),
    remarks: z.string().max(500).optional(),
  }))
    .min(1, "At least one result is required")
    .max(100, "Maximum 100 results can be approved at once"),
}).strict();

// Result statistics schema
export const resultStatisticsSchema = z.object({
  student_id: z.string().uuid("Invalid student ID").optional(),
  course_id: z.string().uuid("Invalid course ID").optional(),
  session_id: z.string().uuid("Invalid session ID").optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  department_id: z.string().uuid("Invalid department ID").optional(),
  level: z.enum(["100", "200", "300", "400", "500"]).optional(),
}).strict();

// Result history schema
export const resultHistorySchema = z.object({
  id: z.string().uuid("Invalid result history ID"),
  result_id: z.string().uuid("Invalid result ID"),
  old_score: z.number()
    .int("Old score must be an integer")
    .min(0, "Old score must be at least 0")
    .max(100, "Old score must be at most 100")
    .optional(),
  new_score: z.number()
    .int("New score must be an integer")
    .min(0, "New score must be at least 0")
    .max(100, "New score must be at most 100")
    .optional(),
  old_grade: z.string().optional(),
  new_grade: z.string().optional(),
  old_status: z.enum(["pending", "approved", "rejected"]).optional(),
  new_status: z.enum(["pending", "approved", "rejected"]).optional(),
  changed_by: z.string().uuid("Invalid changed_by ID").optional(),
  change_reason: z.string()
    .max(500, "Change reason must be less than 500 characters")
    .optional(),
  changed_at: z.string().datetime("Invalid changed_at timestamp").optional(),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
}).strict();

// Result history creation schema
export const createResultHistorySchema = resultHistorySchema.omit({
  id: true,
  created_at: true,
});

// ============================================================
// TYPES
// ============================================================

export type ResultInput = z.infer<typeof resultSchema>;
export type CreateResultInput = z.infer<typeof createResultSchema>;
export type UpdateResultInput = z.infer<typeof updateResultSchema>;
export type ResultSearchInput = z.infer<typeof resultSearchSchema>;
export type BulkResultInput = z.infer<typeof bulkResultSchema>;
export type ResultImportInput = z.infer<typeof resultImportSchema>;
export type BulkResultImportInput = z.infer<typeof bulkResultImportSchema>;
export type ResultApprovalInput = z.infer<typeof resultApprovalSchema>;
export type BulkResultApprovalInput = z.infer<typeof bulkResultApprovalSchema>;
export type ResultStatisticsInput = z.infer<typeof resultStatisticsSchema>;
export type ResultHistoryInput = z.infer<typeof resultHistorySchema>;
export type CreateResultHistoryInput = z.infer<typeof createResultHistorySchema>; 