import { z } from "zod";

// ============================================================
// RPC PARAMETER SCHEMAS
// ============================================================

// ============================================================
// BROADSHEET GENERATION
// ============================================================

// Broadsheet generation parameters
export const broadsheetGenerationSchema = z.object({
  department_id: z.string().uuid("Invalid department ID"),
  session_id: z.string().uuid("Invalid session ID"),
  level: z.enum(["100", "200", "300", "400", "500"], {
    errorMap: () => ({ message: "Level must be 100, 200, 300, 400, or 500" })
  }),
  semester: z.enum(["First", "Second", "Summer"], {
    errorMap: () => ({ message: "Semester must be First, Second, or Summer" })
  }).optional(),
  include_pending: z.boolean().default(false),
  include_rejected: z.boolean().default(false),
  format: z.enum(["pdf", "excel", "csv"], {
    errorMap: () => ({ message: "Format must be pdf, excel, or csv" })
  }).default("pdf"),
  include_statistics: z.boolean().default(true),
  include_grade_distribution: z.boolean().default(true),
  include_department_summary: z.boolean().default(true),
}).strict();

// Broadsheet generation with filters
export const broadsheetGenerationWithFiltersSchema = broadsheetGenerationSchema.extend({
  filters: z.object({
    student_ids: z.array(z.string().uuid("Invalid student ID")).optional(),
    course_ids: z.array(z.string().uuid("Invalid course ID")).optional(),
    min_score: z.number()
      .int("Min score must be an integer")
      .min(0, "Min score must be at least 0")
      .max(100, "Min score must be at most 100")
      .optional(),
    max_score: z.number()
      .int("Max score must be an integer")
      .min(0, "Max score must be at least 0")
      .max(100, "Max score must be at most 100")
      .optional(),
    grades: z.array(z.string().regex(/^[A-F][+-]?$/, "Grade must be A, B, C, D, F with optional + or -")).optional(),
  }).optional(),
}).strict();

// ============================================================
// TRANSCRIPT GENERATION
// ============================================================

// Transcript generation parameters
export const transcriptGenerationSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  session_id: z.string().uuid("Invalid session ID").optional(), // If not provided, generates for all sessions
  include_pending: z.boolean().default(false),
  include_rejected: z.boolean().default(false),
  format: z.enum(["pdf", "excel", "csv"], {
    errorMap: () => ({ message: "Format must be pdf, excel, or csv" })
  }).default("pdf"),
  include_cgpa: z.boolean().default(true),
  include_grade_distribution: z.boolean().default(true),
  include_course_details: z.boolean().default(true),
  include_academic_history: z.boolean().default(true),
}).strict();

// Transcript generation with custom options
export const transcriptGenerationWithOptionsSchema = transcriptGenerationSchema.extend({
  options: z.object({
    show_remarks: z.boolean().default(false),
    show_grade_points: z.boolean().default(true),
    show_percentages: z.boolean().default(true),
    include_failed_courses: z.boolean().default(true),
    include_withdrawn_courses: z.boolean().default(false),
    custom_header: z.string().max(500, "Custom header too long").optional(),
    custom_footer: z.string().max(500, "Custom footer too long").optional(),
  }).optional(),
}).strict();

// ============================================================
// GPA/CGPA CALCULATION
// ============================================================

// GPA calculation parameters
export const gpaCalculationSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  session_id: z.string().uuid("Invalid session ID"),
  semester: z.enum(["First", "Second", "Summer"], {
    errorMap: () => ({ message: "Semester must be First, Second, or Summer" })
  }).optional(),
  include_pending: z.boolean().default(false),
  include_failed: z.boolean().default(true),
  policy_version: z.number()
    .int("Policy version must be an integer")
    .min(1, "Policy version must be at least 1")
    .optional(),
}).strict();

// CGPA calculation parameters
export const cgpaCalculationSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  session_ids: z.array(z.string().uuid("Invalid session ID")).optional(), // If not provided, calculates for all sessions
  include_pending: z.boolean().default(false),
  include_failed: z.boolean().default(true),
  policy_version: z.number()
    .int("Policy version must be an integer")
    .min(1, "Policy version must be at least 1")
    .optional(),
  include_breakdown: z.boolean().default(true), // Include semester-wise breakdown
}).strict();

// Bulk GPA calculation parameters
export const bulkGpaCalculationSchema = z.object({
  student_ids: z.array(z.string().uuid("Invalid student ID"))
    .min(1, "At least one student ID is required")
    .max(100, "Maximum 100 students can be processed at once"),
  session_id: z.string().uuid("Invalid session ID"),
  semester: z.enum(["First", "Second", "Summer"]).optional(),
  include_pending: z.boolean().default(false),
  include_failed: z.boolean().default(true),
  policy_version: z.number()
    .int("Policy version must be an integer")
    .min(1, "Policy version must be at least 1")
    .optional(),
}).strict();

// ============================================================
// ACADEMIC SESSION SCHEMAS
// ============================================================

// Academic session schema
export const academicSessionSchema = z.object({
  id: z.string().uuid("Invalid session ID"),
  session_name: z.string()
    .min(4, "Session name must be at least 4 characters")
    .max(20, "Session name must be less than 20 characters")
    .regex(/^\d{4}\/\d{4}$/, "Session name must follow format: 2023/2024"),
  semester: z.enum(["First", "Second", "Summer"], {
    errorMap: () => ({ message: "Semester must be First, Second, or Summer" })
  }),
  is_active: z.boolean().default(false),
  start_date: z.string().datetime("Invalid start date").optional(),
  end_date: z.string().datetime("Invalid end date").optional(),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Academic session creation schema
export const createAcademicSessionSchema = academicSessionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Academic session update schema
export const updateAcademicSessionSchema = createAcademicSessionSchema.partial().extend({
  id: z.string().uuid("Invalid session ID"),
});

// Academic session search schema
export const academicSessionSearchSchema = z.object({
  is_active: z.boolean().optional(),
  semester: z.enum(["First", "Second", "Summer"]).optional(),
  search: z.string().max(100, "Search term too long").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// ============================================================
// SYSTEM SETTINGS SCHEMAS
// ============================================================

// System settings schema
export const systemSettingSchema = z.object({
  id: z.string().uuid("Invalid setting ID"),
  setting_key: z.string()
    .min(2, "Setting key must be at least 2 characters")
    .max(100, "Setting key must be less than 100 characters")
    .regex(/^[a-z_]+$/, "Setting key must be lowercase with underscores only"),
  setting_value: z.string()
    .max(1000, "Setting value must be less than 1000 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// System setting creation schema
export const createSystemSettingSchema = systemSettingSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// System setting update schema
export const updateSystemSettingSchema = createSystemSettingSchema.partial().extend({
  id: z.string().uuid("Invalid setting ID"),
});

// System setting search schema
export const systemSettingSearchSchema = z.object({
  is_active: z.boolean().optional(),
  search: z.string().max(100, "Search term too long").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// ============================================================
// TYPES
// ============================================================

// Broadsheet types
export type BroadsheetGenerationInput = z.infer<typeof broadsheetGenerationSchema>;
export type BroadsheetGenerationWithFiltersInput = z.infer<typeof broadsheetGenerationWithFiltersSchema>;

// Transcript types
export type TranscriptGenerationInput = z.infer<typeof transcriptGenerationSchema>;
export type TranscriptGenerationWithOptionsInput = z.infer<typeof transcriptGenerationWithOptionsSchema>;

// GPA/CGPA types
export type GpaCalculationInput = z.infer<typeof gpaCalculationSchema>;
export type CgpaCalculationInput = z.infer<typeof cgpaCalculationSchema>;
export type BulkGpaCalculationInput = z.infer<typeof bulkGpaCalculationSchema>;

// Academic session types
export type AcademicSessionInput = z.infer<typeof academicSessionSchema>;
export type CreateAcademicSessionInput = z.infer<typeof createAcademicSessionSchema>;
export type UpdateAcademicSessionInput = z.infer<typeof updateAcademicSessionSchema>;
export type AcademicSessionSearchInput = z.infer<typeof academicSessionSearchSchema>;

// System settings types
export type SystemSettingInput = z.infer<typeof systemSettingSchema>;
export type CreateSystemSettingInput = z.infer<typeof createSystemSettingSchema>;
export type UpdateSystemSettingInput = z.infer<typeof updateSystemSettingSchema>;
export type SystemSettingSearchInput = z.infer<typeof systemSettingSearchSchema>; 