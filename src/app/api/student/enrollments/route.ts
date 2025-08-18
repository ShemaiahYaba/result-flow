import { makeRoute } from '@/lib/api/routeFactory';
import { EnrollmentsResponseSchema } from '@/schemas/student/api';

/**
 * GET /api/student/enrollments
 * Fetch student's course enrollments (current and history)
 */
export const GET = makeRoute({
  method: 'GET',
  output: EnrollmentsResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user }) => {
    // Get student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Get current active session
    const { data: currentSession, error: sessionError } = await supabase
      .from('academic_sessions')
      .select('id')
      .eq('is_active', true)
      .single();

    if (sessionError) throw sessionError;

    // Get current enrollments
    const { data: currentEnrollments, error: currentError } = await supabase
      .from('student_courses')
      .select(`
        id,
        student_id,
        course_id,
        session_id,
        enrollment_date,
        is_active,
        courses!inner(
          id,
          course_code,
          course_title,
          unit,
          level,
          semester,
          department_id,
          description,
          is_active
        )
      `)
      .eq('student_id', student.id)
      .eq('session_id', currentSession.id)
      .eq('is_active', true)
      .order('enrollment_date', { ascending: false });

    if (currentError) throw currentError;

    // Get historical enrollments
    const { data: historicalEnrollments, error: historyError } = await supabase
      .from('student_courses')
      .select(`
        id,
        student_id,
        course_id,
        session_id,
        enrollment_date,
        is_active,
        courses!inner(
          id,
          course_code,
          course_title,
          unit,
          level,
          semester,
          department_id,
          description,
          is_active
        )
      `)
      .eq('student_id', student.id)
      .neq('session_id', currentSession.id)
      .order('enrollment_date', { ascending: false });

    if (historyError) throw historyError;

    // Format enrollments
    const formatEnrollments = (enrollments: any[]) => 
      enrollments.map(enrollment => ({
        id: enrollment.id,
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        session_id: enrollment.session_id,
        enrollment_date: enrollment.enrollment_date,
        is_active: enrollment.is_active,
        course: {
          id: enrollment.courses.id,
          course_code: enrollment.courses.course_code,
          course_name: enrollment.courses.course_title,
          unit: enrollment.courses.unit,
          level: enrollment.courses.level,
          semester: enrollment.courses.semester,
          department_id: enrollment.courses.department_id,
          description: enrollment.courses.description,
          is_active: enrollment.courses.is_active
        }
      }));

    return {
      current: formatEnrollments(currentEnrollments || []),
      history: formatEnrollments(historicalEnrollments || []),
      meta: {
        current_count: currentEnrollments?.length || 0,
        history_count: historicalEnrollments?.length || 0
      }
    };
  }
});
