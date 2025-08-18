import { makeRoute } from '@/lib/api/routeFactory';
import { CurrentResultsResponseSchema } from '@/schemas/student/api';

/**
 * GET /api/student/results/current
 * Fetch current semester results for the authenticated student
 */
export const GET = makeRoute({
  method: 'GET',
  output: CurrentResultsResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user }) => {
    // Get current active session
    const { data: currentSession, error: sessionError } = await supabase
      .from('academic_sessions')
      .select('id, session_name, semester')
      .eq('is_active', true)
      .single();

    if (sessionError) throw sessionError;

    // Get student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Get current semester results with course details
    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select(`
        id,
        score,
        grade,
        grade_point,
        status,
        courses(
          course_code,
          course_name,
          unit
        )
      `)
      .eq('student_id', student.id)
      .eq('session_id', currentSession.id)
      .eq('status', 'approved');

    if (resultsError) throw resultsError;

    const courses = results.map(result => ({
      course_code: result.courses?.[0]?.course_code || '',
      course_name: result.courses?.[0]?.course_name || '',
      unit: result.courses?.[0]?.unit || 0,
      score: result.score,
      grade: result.grade || undefined,
      grade_point: result.grade_point || undefined,
      status: result.status as 'pending' | 'approved' | 'rejected'
    }));

    return {
      semester: `${currentSession.session_name} - ${currentSession.semester} Semester`,
      session: currentSession.session_name,
      courses
    };
  }
});
