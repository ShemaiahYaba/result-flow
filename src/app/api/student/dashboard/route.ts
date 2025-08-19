import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * GET /api/student/dashboard
 * Get student dashboard statistics and information
 */
const StudentDashboardResponseSchema = z.object({
  student_info: z.object({
    id: z.string(),
    first_name: z.string(),
    middle_name: z.string().nullable(),
    last_name: z.string(),
    matric_number: z.string(),
    department_name: z.string(),
    university_name: z.string()
  }),
  academic_summary: z.object({
    current_level: z.number().nullable(),
    current_semester: z.string().nullable(),
    cumulative_gpa: z.number().nullable(),
    total_units_attempted: z.number(),
    total_units_passed: z.number(),
    total_semesters: z.number()
  }),
  recent_results: z.array(z.object({
    semester_name: z.string(),
    session_name: z.string(),
    semester_gpa: z.number().nullable(),
    total_units: z.number(),
    courses_count: z.number()
  }))
});

export const GET = makeRoute({
  method: 'GET',
  output: StudentDashboardResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user }) => {
    // Use user.user_entity_id directly from the authenticated user
    const studentId = user.user_entity_id;
    
    if (!studentId) {
      throw new Error('Student ID not found in user data');
    }

    // Get student basic info with department and university
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        matric_number,
        departments!students_department_id_fkey (
          department_name,
          universities!departments_university_id_fkey (
            university_name
          )
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError || !studentData) {
      throw new Error('Student not found');
    }

    // Get current enrollment to determine level
    const { data: currentEnrollment } = await supabase
      .from('student_semester_enrollments')
      .select(`
        level,
        academic_semesters!student_semester_enrollments_semester_id_fkey (
          semester_name,
          academic_sessions!academic_semesters_session_id_fkey (
            session_name
          )
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get academic summary from student_semester_summary
    const { data: summaryData } = await supabase
      .from('student_semester_summary')
      .select(`
        semester_gpa,
        total_units_attempted,
        total_units_passed,
        cumulative_gpa,
        academic_semesters!student_semester_summary_semester_id_fkey (
          semester_name,
          academic_sessions!academic_semesters_session_id_fkey (
            session_name
          )
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    // Calculate totals and get recent results
    const totalUnitsAttempted = summaryData?.reduce((sum, s) => sum + (s.total_units_attempted || 0), 0) || 0;
    const totalUnitsPassed = summaryData?.reduce((sum, s) => sum + (s.total_units_passed || 0), 0) || 0;
    const latestSummary = summaryData?.[0];
    
    // Get recent semester results (last 3 semesters)
    const recentResults = (summaryData || []).slice(0, 3).map((summary: any) => {
      const semester = summary.academic_semesters;
      const session = semester?.academic_sessions;
      
      return {
        semester_name: semester?.semester_name || 'Unknown',
        session_name: session?.session_name || 'Unknown',
        semester_gpa: summary.semester_gpa,
        total_units: summary.total_units_attempted || 0,
        courses_count: 0 // Could be calculated from course enrollments if needed
      };
    });

    const department = (studentData as any).departments;
    const university = department?.universities;
    const currentSemester = (currentEnrollment as any)?.academic_semesters;
    const currentSession = currentSemester?.academic_sessions;

    return {
      student_info: {
        id: studentData.id,
        first_name: studentData.first_name,
        middle_name: studentData.middle_name,
        last_name: studentData.last_name,
        matric_number: studentData.matric_number,
        department_name: department?.department_name || 'Unknown',
        university_name: university?.university_name || 'Unknown'
      },
      academic_summary: {
        current_level: currentEnrollment?.level || null,
        current_semester: currentSemester ? `${currentSession?.session_name} - ${currentSemester.semester_name}` : null,
        cumulative_gpa: latestSummary?.cumulative_gpa || null,
        total_units_attempted: totalUnitsAttempted,
        total_units_passed: totalUnitsPassed,
        total_semesters: summaryData?.length || 0
      },
      recent_results: recentResults
    };
  }
});
