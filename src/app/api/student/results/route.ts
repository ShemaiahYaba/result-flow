import { makeRoute, createPaginationMeta } from '@/lib/api/routeFactory';
import { 
  ResultsQuerySchema,
  CourseResultSchema 
} from '@/schemas/student/api';
import { z } from 'zod';

const ResultsListResponseSchema = z.object({
  items: z.array(CourseResultSchema.extend({
    id: z.string().uuid(),
    session_name: z.string(),
    semester_name: z.string(),
    created_at: z.string()
  })),
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
    // Get student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Build query for results
    let query = supabase
      .from('results')
      .select(`
        id,
        score,
        grade,
        grade_point,
        status,
        created_at,
        courses(
          course_code,
          course_name,
          unit
        ),
        academic_sessions(
          session_name,
          semester
        )
      `, { count: 'exact' })
      .eq('student_id', student.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    // Apply filters
    if (input.session_id) {
      query = query.eq('session_id', input.session_id);
    }

    if (input.semester) {
      query = query.eq('academic_sessions.semester', input.semester);
    }

    if (input.course_id) {
      query = query.eq('course_id', input.course_id);
    }

    // Apply pagination
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    query = query.range(offset, offset + limit - 1);

    const { data: results, error: resultsError, count } = await query;

    if (resultsError) throw resultsError;

    const items = (results || []).map(result => ({
      id: result.id,
      course_code: result.courses?.[0]?.course_code || '',
      course_name: result.courses?.[0]?.course_name || '',
      unit: result.courses?.[0]?.unit || 0,
      score: result.score,
      grade: result.grade || undefined,
      grade_point: result.grade_point || undefined,
      status: result.status as 'pending' | 'approved' | 'rejected',
      session_name: result.academic_sessions?.[0]?.session_name || '',
      semester_name: result.academic_sessions?.[0]?.semester || '',
      created_at: result.created_at
    }));

    const meta = createPaginationMeta(count || 0, limit, offset);

    return { items, meta };
  }
});
