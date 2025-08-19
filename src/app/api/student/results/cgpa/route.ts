import { makeRoute } from '@/lib/api/routeFactory';
import { CGPAResponseSchema } from '@/schemas/student/api';

/**
 * GET /api/student/results/cgpa
 * Fetch overall CGPA for the authenticated student
 */
export const GET = makeRoute({
  method: 'GET', 
  output: CGPAResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user }) => {
    // Get student ID from users table
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      throw new Error('Student not found');
    }

    // Get student summary data from student_semester_summary table
    const { data: summaryData, error: summaryError } = await supabase
      .from('student_semester_summary')
      .select('cumulative_gpa, total_units_attempted, total_grade_points')
      .eq('student_id', userData.user_entity_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (summaryError && summaryError.code !== 'PGRST116') {
      throw summaryError;
    }

    // Use existing summary data if available, otherwise return defaults
    const cgpa = summaryData?.cumulative_gpa || 0;
    const totalUnits = summaryData?.total_units_attempted || 0;
    const totalGradePoints = summaryData?.total_grade_points || 0;

    return {
      cgpa: Math.round(cgpa * 100) / 100,
      total_units: totalUnits,
      total_grade_points: Math.round(totalGradePoints * 100) / 100
    };
  }
});
