import { makeRoute } from '@/lib/api/routeFactory';
import { 
  CoursesQuerySchema, 
  CoursesResponseSchema 
} from '@/schemas/student/api';
import { createPaginationMeta } from '@/lib/api/routeFactory';

/**
 * GET /api/student/courses
 * Fetch available courses with optional filters 
 */
export const GET = makeRoute({
  method: 'GET',
  input: CoursesQuerySchema,
  output: CoursesResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user, input }) => {
    // Use the optimized student_available_courses view
    let query = supabase
      .from('student_available_courses')
      .select('*', { count: 'exact' })
      .eq('student_id', user.user_entity_id)
      .order('course_code', { ascending: true });

    // Apply filters
    if (input.level) {
      query = query.eq('level', input.level);
    }

    if (input.semester) {
      query = query.eq('semester', input.semester);
    }

    // Apply pagination
    const offset = input.offset || 0;
    const limit = input.limit || 50;
    query = query.range(offset, offset + limit - 1);

    const { data: courses, error: coursesError, count } = await query;

    if (coursesError) throw coursesError;

    const meta = createPaginationMeta(count || 0, limit, offset);

    return {
      items: courses || [],
      meta
    };
  }
});
