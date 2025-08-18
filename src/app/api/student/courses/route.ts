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
    // Get student info to determine department and level
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('department_id, level')
      .eq('profile_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Build query for courses
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('department_id', student.department_id)
      .eq('is_active', true)
      .order('course_code', { ascending: true });

    // Apply filters
    if (input.level) {
      query = query.eq('level', input.level);
    } else {
      // Default to student's current level and below
      query = query.lte('level', student.level);
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
