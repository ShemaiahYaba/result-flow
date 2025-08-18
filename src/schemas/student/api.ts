import { z } from 'zod';

// ============================================================
// STUDENT API SCHEMAS
// ============================================================

// Profile schemas
export const StudentProfileResponseSchema = z.object({
  id: z.string().uuid(),
  firstname: z.string(),
  middlename: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  phone_number: z.string().nullable(),
  department: z.string(),
  department_id: z.string().uuid(),
  matric_number: z.string(),
  level: z.enum(['100', '200', '300', '400', '500']),
  role: z.literal('student')
});

export const UpdateProfileRequestSchema = z.object({
  firstname: z.string().min(2).max(255).optional(),
  middlename: z.string().min(2).max(255).optional(),
  lastname: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  phone_number: z.string().min(10).max(20).optional()
});

export const UpdatePasswordRequestSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(6)
});

// Results schemas
export const CourseResultSchema = z.object({
  course_code: z.string(),
  course_name: z.string(),
  unit: z.number().int().min(1).max(6),
  score: z.number().min(0).max(100),
  grade: z.string().optional(),
  grade_point: z.number().optional(),
  status: z.enum(['pending', 'approved', 'rejected'])
});

export const CurrentResultsResponseSchema = z.object({
  semester: z.string(),
  session: z.string(),
  courses: z.array(CourseResultSchema)
});

export const PastResultsResponseSchema = z.object({
  sessions: z.array(z.object({
    session: z.string(),
    semester: z.string(),
    gpa: z.number().min(0).max(5),
    courses: z.array(CourseResultSchema)
  }))
});

export const GPAResponseSchema = z.object({
  semester: z.string(),
  session: z.string(),
  gpa: z.number().min(0).max(5)
});

export const CGPAResponseSchema = z.object({
  cgpa: z.number().min(0).max(5),
  total_units: z.number().int().min(0),
  total_grade_points: z.number().min(0)
});

// Query parameters
export const ResultsQuerySchema = z.object({
  session_id: z.string().uuid().optional(),
  semester: z.enum(['First', 'Second', 'Summer']).optional(),
  course_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const CoursesQuerySchema = z.object({
  level: z.enum(['100', '200', '300', '400', '500']).optional(),
  semester: z.enum(['First', 'Second', 'Summer']).optional(),
  session_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

// Course enrollment schemas
export const CourseSchema = z.object({
  id: z.string().uuid(),
  course_code: z.string(),
  course_name: z.string(),
  unit: z.number().int().min(1).max(6),
  level: z.enum(['100', '200', '300', '400', '500']),
  semester: z.enum(['First', 'Second', 'Summer']),
  department_id: z.string().uuid(),
  description: z.string().nullable(),
  is_active: z.boolean()
});

export const EnrollmentSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  course_id: z.string().uuid(),
  session_id: z.string().uuid(),
  enrollment_date: z.string(),
  is_active: z.boolean(),
  course: CourseSchema
});

export const CoursesResponseSchema = z.object({
  items: z.array(CourseSchema),
  meta: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    hasMore: z.boolean()
  })
});

export const EnrollmentsResponseSchema = z.object({
  current: z.array(EnrollmentSchema),
  history: z.array(EnrollmentSchema),
  meta: z.object({
    current_count: z.number().int().min(0),
    history_count: z.number().int().min(0)
  })
});

// Generic response schemas
export const MessageResponseSchema = z.object({
  message: z.string()
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type StudentProfileResponse = z.infer<typeof StudentProfileResponseSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequestSchema>;
export type CourseResult = z.infer<typeof CourseResultSchema>;
export type CurrentResultsResponse = z.infer<typeof CurrentResultsResponseSchema>;
export type PastResultsResponse = z.infer<typeof PastResultsResponseSchema>;
export type GPAResponse = z.infer<typeof GPAResponseSchema>;
export type CGPAResponse = z.infer<typeof CGPAResponseSchema>;
export type ResultsQuery = z.infer<typeof ResultsQuerySchema>;
export type CoursesQuery = z.infer<typeof CoursesQuerySchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Enrollment = z.infer<typeof EnrollmentSchema>;
export type CoursesResponse = z.infer<typeof CoursesResponseSchema>;
export type EnrollmentsResponse = z.infer<typeof EnrollmentsResponseSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
