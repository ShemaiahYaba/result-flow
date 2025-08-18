import { makeRoute } from '@/lib/api/routeFactory';
import { PastResultsResponseSchema } from '@/schemas/student/api';

/**
 * GET /api/student/results/past
 * Fetch past academic session results for the authenticated student
 */
export const GET = makeRoute({
  method: 'GET',
  output: PastResultsResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user }) => {
    // Get student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Get all past sessions (not current active session)
    const { data: pastSessions, error: sessionsError } = await supabase
      .from('academic_sessions')
      .select('id, session_name, semester')
      .eq('is_active', false)
      .order('session_name', { ascending: false });

    if (sessionsError) throw sessionsError;

    const sessions = [];

    for (const session of pastSessions) {
      // Get results for this session
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
        .eq('session_id', session.id)
        .eq('status', 'approved');

      if (resultsError) continue; // Skip sessions with errors

      if (results.length > 0) {
        // Calculate GPA for this session
        const totalGradePoints = results.reduce((sum, result) => 
          sum + (result.grade_point || 0) * (result.courses?.[0]?.unit || 0), 0);
        const totalUnits = results.reduce((sum, result) => 
          sum + (result.courses?.[0]?.unit || 0), 0);
        const gpa = totalUnits > 0 ? totalGradePoints / totalUnits : 0;

        const courses = results.map(result => ({
          course_code: result.courses?.[0]?.course_code || '',
          course_name: result.courses?.[0]?.course_name || '',
          unit: result.courses?.[0]?.unit || 0,
          score: result.score,
          grade: result.grade || undefined,
          grade_point: result.grade_point || undefined,
          status: result.status as 'pending' | 'approved' | 'rejected'
        }));

        sessions.push({
          session: session.session_name,
          semester: `${session.semester} Semester`,
          gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
          courses
        });
      }
    }

    return { sessions };
  }
});
