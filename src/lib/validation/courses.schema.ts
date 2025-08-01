import { z } from "zod";

// ============================================================
// COURSE SCHEMAS
// ============================================================

// Base course schema
export const courseSchema = z.object({
  id: z.string().uuid("Invalid course ID"),
  course_code: z.string()
    .min(3, "Course code must be at least 3 characters")
    .max(20, "Course code must be less than 20 characters")
    .regex(/^[A-Z]{2,4}\d{3,4}$/, "Course code must follow format: CS101, MATH201, etc."),
  course_title: z.string()
    .min(5, "Course title must be at least 5 characters")
    .max(255, "Course title must be less than 255 characters"),
  unit: z.number()
    .int("Unit must be an integer")
    .min(1, "Unit must be at least 1")
    .max(6, "Unit must be at most 6"),
  level: z.enum(["100", "200", "300", "400", "500"], {
    errorMap: () => ({ message: "Level must be 100, 200, 300, 400, or 500" })
  }),
  semester: z.enum(["First", "Second", "Summer"], {
    errorMap: () => ({ message: "Semester must be First, Second, or Summer" })
  }),
  department_id: z.string().uuid("Invalid department ID"),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Course creation schema (without ID and timestamps)
export const createCourseSchema = courseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Course update schema (all fields optional except ID)
export const updateCourseSchema = createCourseSchema.partial().extend({
  id: z.string().uuid("Invalid course ID"),
});

// Course search/filter schema
export const courseSearchSchema = z.object({
  level: z.enum(["100", "200", "300", "400", "500"]).optional(),
  semester: z.enum(["First", "Second", "Summer"]).optional(),
  department_id: z.string().uuid("Invalid department ID").optional(),
  is_active: z.boolean().optional(),
  search: z.string().max(100, "Search term too long").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// Bulk course creation schema
export const bulkCourseSchema = z.object({
  courses: z.array(createCourseSchema)
    .min(1, "At least one course is required")
    .max(100, "Maximum 100 courses can be created at once"),
}).strict();

// Course import/export schema for CSV/Excel
export const courseImportSchema = z.object({
  course_code: z.string()
    .min(3, "Course code must be at least 3 characters")
    .max(20, "Course code must be less than 20 characters"),
  course_title: z.string()
    .min(5, "Course title must be at least 5 characters")
    .max(255, "Course title must be less than 255 characters"),
  unit: z.number()
    .int("Unit must be an integer")
    .min(1, "Unit must be at least 1")
    .max(6, "Unit must be at most 6"),
  level: z.enum(["100", "200", "300", "400", "500"]),
  semester: z.enum(["First", "Second", "Summer"]),
  department_code: z.string()
    .min(2, "Department code must be at least 2 characters")
    .max(20, "Department code must be less than 20 characters"),
  description: z.string().optional(),
}).strict();

// Bulk course import schema
export const bulkCourseImportSchema = z.object({
  courses: z.array(courseImportSchema)
    .min(1, "At least one course is required")
    .max(100, "Maximum 100 courses can be imported at once"),
  department_mapping: z.record(z.string(), z.string().uuid()).optional(), // department_code -> department_id
}).strict();

// Course prerequisites schema
export const coursePrerequisiteSchema = z.object({
  id: z.string().uuid("Invalid prerequisite ID"),
  course_id: z.string().uuid("Invalid course ID"),
  prerequisite_course_id: z.string().uuid("Invalid prerequisite course ID"),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Course prerequisite creation schema
export const createCoursePrerequisiteSchema = coursePrerequisiteSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Course prerequisite update schema
export const updateCoursePrerequisiteSchema = createCoursePrerequisiteSchema.partial().extend({
  id: z.string().uuid("Invalid prerequisite ID"),
});

// Course statistics schema
export const courseStatisticsSchema = z.object({
  department_id: z.string().uuid("Invalid department ID").optional(),
  level: z.enum(["100", "200", "300", "400", "500"]).optional(),
  semester: z.enum(["First", "Second", "Summer"]).optional(),
  is_active: z.boolean().optional(),
}).strict();

// Course enrollment statistics schema
export const courseEnrollmentStatisticsSchema = z.object({
  course_id: z.string().uuid("Invalid course ID").optional(),
  session_id: z.string().uuid("Invalid session ID").optional(),
  department_id: z.string().uuid("Invalid department ID").optional(),
  level: z.enum(["100", "200", "300", "400", "500"]).optional(),
}).strict();

// ============================================================
// TYPES
// ============================================================

export type CourseInput = z.infer<typeof courseSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseSearchInput = z.infer<typeof courseSearchSchema>;
export type BulkCourseInput = z.infer<typeof bulkCourseSchema>;
export type CourseImportInput = z.infer<typeof courseImportSchema>;
export type BulkCourseImportInput = z.infer<typeof bulkCourseImportSchema>;
export type CoursePrerequisiteInput = z.infer<typeof coursePrerequisiteSchema>;
export type CreateCoursePrerequisiteInput = z.infer<typeof createCoursePrerequisiteSchema>;
export type UpdateCoursePrerequisiteInput = z.infer<typeof updateCoursePrerequisiteSchema>;
export type CourseStatisticsInput = z.infer<typeof courseStatisticsSchema>;
export type CourseEnrollmentStatisticsInput = z.infer<typeof courseEnrollmentStatisticsSchema>; 