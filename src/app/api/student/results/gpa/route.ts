import { makeRoute } from '@/lib/api/routeFactory';
import { GPAResponseSchema } from '@/schemas/student/api';

/**
 * GET /api/student/results/gpa
 * Fetch current semester GPA for the authenticated student
 */
export const GET = makeRoute({
  method: 'GET',
  output: GPAResponseSchema,
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

    // Get current semester results with course units and grade points
    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select(`
        grade_point,
        courses!inner(
          unit
        )
      `)
      .eq('student_id', student.id)
      .eq('session_id', currentSession.id)
      .eq('status', 'approved')
      .not('grade_point', 'is', null);

    if (resultsError) throw resultsError;

    // Calculate GPA
    let gpa = 0;
    if (results.length > 0) {
      const totalGradePoints = results.reduce((sum, result) => 
        sum + (result.grade_point || 0) * (result.courses?.[0]?.unit || 0), 0);
      const totalUnits = results.reduce((sum, result) => 
        sum + (result.courses?.[0]?.unit || 0), 0);
      
      gpa = totalUnits > 0 ? totalGradePoints / totalUnits : 0;
    }

    return {
      semester: `${currentSession.session_name} - ${currentSession.semester} Semester`,
      session: currentSession.session_name,
      gpa: Math.round(gpa * 100) / 100 // Round to 2 decimal places
    };
  }
});
