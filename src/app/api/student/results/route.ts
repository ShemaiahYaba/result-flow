import { makeRoute, createPaginationMeta } from '@/lib/api/routeFactory';
import { z } from 'zod';

// Schema for results query parameters
const ResultsQuerySchema = z.object({
  semester_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(100).optional()
});

// Schema for course result item
const CourseResultSchema = z.object({
  id: z.string().uuid(),
  course_code: z.string(),
  course_name: z.string(),
  credit_units: z.number(),
  score: z.number(),
  grade: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  session_name: z.string(),
  semester_name: z.string(),
  semester_number: z.number(),
  created_at: z.string()
});

const ResultsListResponseSchema = z.object({
  items: z.array(CourseResultSchema),
  meta: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
    hasMore: z.boolean()
  })
});

/**
 * GET /api/student/results
 * Fetch student results with optional filters and pagination
 */
export const GET = makeRoute({
  method: 'GET',
  input: ResultsQuerySchema,
  output: ResultsListResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user, input }) => {
    // Get student entity ID from users table
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    // Build query for results using new schema structure
    let query = supabase
      .from('results_new')
      .select(`
        id,
        score,
        grade,
        status,
        created_at,
        student_course_enrollments!inner (
          id,
          course_id,
          student_semester_enrollments!inner (
            id,
            student_id,
            semester_id,
            academic_semesters!inner (
              id,
              semester_name,
              semester_number,
              session_id,
              academic_sessions!inner (
                session_name
              )
            )
          ),
          courses!inner (
            course_code,
            course_name,
            credit_units
          )
        )
      `, { count: 'exact' })
      .eq('student_course_enrollments.student_semester_enrollments.student_id', userData.user_entity_id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    // Apply filters
    if (input.semester_id) {
      query = query.eq('student_course_enrollments.student_semester_enrollments.semester_id', input.semester_id);
    }

    if (input.course_id) {
      query = query.eq('student_course_enrollments.course_id', input.course_id);
    }

    // Apply pagination
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    query = query.range(offset, offset + limit - 1);

    const { data: results, error: resultsError, count } = await query;

    if (resultsError) {
      throw new Error(`Failed to fetch results: ${resultsError.message}`);
    }

    const items = (results || []).map(result => {
      const enrollment = Array.isArray(result.student_course_enrollments) 
        ? result.student_course_enrollments[0] 
        : result.student_course_enrollments;
      
      const semesterEnrollment = Array.isArray(enrollment?.student_semester_enrollments)
        ? enrollment?.student_semester_enrollments[0]
        : enrollment?.student_semester_enrollments;
      
      const semester = Array.isArray(semesterEnrollment?.academic_semesters)
        ? semesterEnrollment?.academic_semesters[0]
        : semesterEnrollment?.academic_semesters;
      
      const session = Array.isArray(semester?.academic_sessions)
        ? semester?.academic_sessions[0]
        : semester?.academic_sessions;
      
      const course = Array.isArray(enrollment?.courses)
        ? enrollment?.courses[0]
        : enrollment?.courses;

      return {
        id: result.id,
        course_code: (course as any)?.course_code || '',
        course_name: (course as any)?.course_name || '',
        credit_units: (course as any)?.credit_units || 0,
        score: result.score,
        grade: result.grade || '',
        status: result.status as 'pending' | 'approved' | 'rejected',
        session_name: (session as any)?.session_name || '',
        semester_name: (semester as any)?.semester_name || '',
        semester_number: (semester as any)?.semester_number || 0,
        created_at: result.created_at
      };
    });

    const meta = createPaginationMeta(count || 0, limit, offset);

    return { items, meta };
  }
});
