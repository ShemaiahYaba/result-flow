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
    // Get student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Get all approved results with course units and grade points
    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select(`
        grade_point,
        courses(
          unit
        )
      `)
      .eq('student_id', student.id)
      .eq('status', 'approved')
      .not('grade_point', 'is', null);

    if (resultsError) throw resultsError;

    // Calculate CGPA
    let cgpa = 0;
    let totalUnits = 0;
    let totalGradePoints = 0;

    if (results.length > 0) {
      totalGradePoints = results.reduce((sum, result) => 
        sum + (result.grade_point || 0) * (result.courses?.[0]?.unit || 0), 0);
      totalUnits = results.reduce((sum, result) => 
        sum + (result.courses?.[0]?.unit || 0), 0);
      
      cgpa = totalUnits > 0 ? totalGradePoints / totalUnits : 0;
    }

    return {
      cgpa: Math.round(cgpa * 100) / 100, // Round to 2 decimal places
      total_units: totalUnits,
      total_grade_points: Math.round(totalGradePoints * 100) / 100
    };
  }
});
