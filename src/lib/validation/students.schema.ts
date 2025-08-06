import { z } from "zod";

// ============================================================
// STUDENT SCHEMAS
// ============================================================

// Base student schema (from students table)
export const studentSchema = z.object({
  id: z.string().uuid("Invalid student ID"),
  matric_number: z.string()
    .min(5, "Matric number must be at least 5 characters")
    .max(50, "Matric number must be less than 50 characters")
    .regex(/^[A-Z]\/[A-Z]{2}\/\d{2}\/\d{7}$/, "Matric number must follow format: F/HD/21/1234567"),
  profile_id: z.string().uuid("Invalid profile ID"),
  full_name: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name must be less than 255 characters")
    .regex(/^[A-Za-z\s]+$/, "Full name can only contain letters and spaces"),
  level: z.enum(["100", "200", "300", "400", "500"], {
    errorMap: () => ({ message: "Level must be 100, 200, 300, 400, or 500" })
  }),
  department_id: z.string().uuid("Invalid department ID"),
  session_id: z.string().uuid("Invalid session ID"),
  enrollment_date: z.string().datetime("Invalid enrollment date").optional(),
  graduation_date: z.string().datetime("Invalid graduation date").optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Student with joined data (from Supabase queries)
export const studentWithJoinsSchema = studentSchema.extend({
  profiles: z.object({
    id: z.string().uuid("Invalid profile ID"),
    full_name: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    phone_number: z.string().optional(),
    role: z.enum(["admin", "hod", "student"]).optional(),
  }).optional(),
  departments: z.object({
    id: z.string().uuid("Invalid department ID"),
    department_name: z.string().optional(),
    department_code: z.string().optional(),
  }).optional(),
  academic_sessions: z.object({
    id: z.string().uuid("Invalid session ID"),
    session_name: z.string().optional(),
    is_active: z.boolean().optional(),
  }).optional(),
}).strict();

// Student creation schema (without ID and timestamps)
export const createStudentSchema = studentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Student update schema (all fields optional except ID)
export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().uuid("Invalid student ID"),
});

// Student search/filter schema
export const studentSearchSchema = z.object({
  level: z.enum(["100", "200", "300", "400", "500"]).optional(),
  department_id: z.string().uuid("Invalid department ID").optional(),
  session_id: z.string().uuid("Invalid session ID").optional(),
  is_active: z.boolean().optional(),
  search: z.string().max(100, "Search term too long").optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// Bulk student creation schema
export const bulkStudentSchema = z.object({
  students: z.array(createStudentSchema)
    .min(1, "At least one student is required")
    .max(1000, "Maximum 1000 students can be created at once"),
}).strict();

// Student course enrollment schema
export const studentCourseSchema = z.object({
  id: z.string().uuid("Invalid student course ID"),
  student_id: z.string().uuid("Invalid student ID"),
  course_id: z.string().uuid("Invalid course ID"),
  session_id: z.string().uuid("Invalid session ID"),
  enrolled_by: z.string().uuid("Invalid enrolled_by ID").optional(),
  enrollment_date: z.string().datetime("Invalid enrollment date").optional(),
  withdrawal_date: z.string().datetime("Invalid withdrawal date").optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime("Invalid created_at timestamp").optional(),
  updated_at: z.string().datetime("Invalid updated_at timestamp").optional(),
}).strict();

// Student course creation schema
export const createStudentCourseSchema = studentCourseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Student course update schema
export const updateStudentCourseSchema = createStudentCourseSchema.partial().extend({
  id: z.string().uuid("Invalid student course ID"),
});

// Bulk student course enrollment schema
export const bulkStudentCourseSchema = z.object({
  enrollments: z.array(createStudentCourseSchema)
    .min(1, "At least one enrollment is required")
    .max(500, "Maximum 500 enrollments can be created at once"),
}).strict();

// Student course search schema
export const studentCourseSearchSchema = z.object({
  student_id: z.string().uuid("Invalid student ID").optional(),
  course_id: z.string().uuid("Invalid course ID").optional(),
  session_id: z.string().uuid("Invalid session ID").optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit must be at most 100").default(20),
}).strict();

// Student import/export schema for CSV/Excel
export const studentImportSchema = z.object({
  matric_number: z.string()
    .min(5, "Matric number must be at least 5 characters")
    .max(50, "Matric number must be less than 50 characters"),
  full_name: z.string()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name must be less than 255 characters"),
  level: z.enum(["100", "200", "300", "400", "500"]),
  department_code: z.string()
    .min(2, "Department code must be at least 2 characters")
    .max(20, "Department code must be less than 20 characters"),
  session_name: z.string()
    .min(4, "Session name must be at least 4 characters")
    .max(20, "Session name must be less than 20 characters"),
  enrollment_date: z.string().optional(),
}).strict();

// Bulk student import schema
export const bulkStudentImportSchema = z.object({
  students: z.array(studentImportSchema)
    .min(1, "At least one student is required")
    .max(1000, "Maximum 1000 students can be imported at once"),
  department_mapping: z.record(z.string(), z.string().uuid()).optional(), // department_code -> department_id
  session_mapping: z.record(z.string(), z.string().uuid()).optional(), // session_name -> session_id
}).strict();

// Student statistics schema
export const studentStatisticsSchema = z.object({
  department_id: z.string().uuid("Invalid department ID").optional(),
  session_id: z.string().uuid("Invalid session ID").optional(),
  level: z.enum(["100", "200", "300", "400", "500"]).optional(),
  is_active: z.boolean().optional(),
}).strict();

// ============================================================
// TYPES
// ============================================================

export type StudentInput = z.infer<typeof studentSchema>;
export type StudentWithJoins = z.infer<typeof studentWithJoinsSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentSearchInput = z.infer<typeof studentSearchSchema>;
export type BulkStudentInput = z.infer<typeof bulkStudentSchema>;
export type StudentCourseInput = z.infer<typeof studentCourseSchema>;
export type CreateStudentCourseInput = z.infer<typeof createStudentCourseSchema>;
export type UpdateStudentCourseInput = z.infer<typeof updateStudentCourseSchema>;
export type BulkStudentCourseInput = z.infer<typeof bulkStudentCourseSchema>;
export type StudentCourseSearchInput = z.infer<typeof studentCourseSearchSchema>;
export type StudentImportInput = z.infer<typeof studentImportSchema>;
export type BulkStudentImportInput = z.infer<typeof bulkStudentImportSchema>;
export type StudentStatisticsInput = z.infer<typeof studentStatisticsSchema>; 