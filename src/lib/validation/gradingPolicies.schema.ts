import { z } from "zod";

// ============================================================
// GRADING POLICY SCHEMAS
// ============================================================

// Base grading policy schema
export const gradingPolicySchema = z.object({
  id: z.string().uuid("Invalid grading policy ID"),
  grade: z.string()
    .min(1, "Grade must be at least 1 character")
    .max(5, "Grade must be less than 5 characters")
    .regex(/^[A-F][+-]?$/, "Grade must be A, B, C, D, F with optional + or -"),
  min_score: z.number()
    .int("Min score must be an integer")
    .min(0, "Min score must be at least 0")
    .max(100, "Min score must be at most 100"),
  max_score: z.number()
    .int("Max score must be an integer")
    .min(0, "Max score must be at least 0")
    .max(100, "Max score must be at most 100"),
  grade_point: z.number()
    .min(0, "Grade point must be at least 0")
    .max(5, "Grade point must be at most 5")
    .multipleOf(0.01, "Grade point must have at most 2 decimal places"),
  version: z.number()
    .int("Version must be an integer")
    .min(1, "Version must be at least 1"),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict().refine((data) => data.min_score <= data.max_score, {
  message: "Min score must be less than or equal to max score",
  path: ["min_score"],
});

// Grading policy creation schema (without ID and timestamps)
export const createGradingPolicySchema = gradingPolicySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Grading policy update schema (all fields optional except ID)
export const updateGradingPolicySchema = createGradingPolicySchema.partial().extend({
  id: z.string().uuid("Invalid grading policy ID"),
});

// Grading policy search/filter schema
export const gradingPolicySearchSchema = z.object({
  grade: z.string().optional(),
  is_active: z.boolean().optional(),
  version: z.number().int().min(1).optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// Bulk grading policy creation schema
export const bulkGradingPolicySchema = z.object({
  policies: z.array(createGradingPolicySchema)
    .min(1, "At least one policy is required")
    .max(50, "Maximum 50 policies can be created at once"),
}).strict();

// Grade calculation input schema
export const gradeCalculationSchema = z.object({
  score: z.number()
    .int("Score must be an integer")
    .min(0, "Score must be at least 0")
    .max(100, "Score must be at most 100"),
  policy_version: z.number().int().min(1, "Policy version must be at least 1").optional(),
}).strict();

// ============================================================
// TYPES
// ============================================================

export type GradingPolicyInput = z.infer<typeof gradingPolicySchema>;
export type CreateGradingPolicyInput = z.infer<typeof createGradingPolicySchema>;
export type UpdateGradingPolicyInput = z.infer<typeof updateGradingPolicySchema>;
export type GradingPolicySearchInput = z.infer<typeof gradingPolicySearchSchema>;
export type BulkGradingPolicyInput = z.infer<typeof bulkGradingPolicySchema>;
export type GradeCalculationInput = z.infer<typeof gradeCalculationSchema>; 