import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Schema for results query parameters
const ResultsQuerySchema = z.object({
  session_id: z.string().uuid().optional(),
  semester_id: z.string().uuid().optional(),
  level: z.number().int().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional()
});

// Schema for semester group
const SemesterResultsSchema = z.object({
  semester_id: z.string(),
  session_name: z.string(),
  semester_name: z.string(),
  level: z.number(),
  semester_gpa: z.number().nullable(),
  total_units_attempted: z.number(),
  total_units_passed: z.number(),
  courses: z.array(z.object({
    result_id: z.string(),
    course_code: z.string(),
    course_title: z.string(),
    course_unit: z.number(),
    score: z.number(),
    grade: z.string(),
    status: z.string(),
    created_at: z.string()
  }))
});

const StudentResultsResponseSchema = z.object({
  student_info: z.object({
    matric_number: z.string(),
    full_name: z.string(),
    department_name: z.string(),
    university_name: z.string()
  }),
  academic_summary: z.object({
    total_semesters: z.number(),
    cumulative_gpa: z.number().nullable(),
    total_units_attempted: z.number(),
    total_units_passed: z.number()
  }),
  semester_results: z.array(SemesterResultsSchema)
});

/**
 * GET /api/student/results
 * Get comprehensive student results grouped by semester with academic summary
 */
export const GET = makeRoute({
  method: 'GET',
  input: ResultsQuerySchema,
  output: StudentResultsResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user, input }) => {
    const studentId = user.user_entity_id;
    
    if (!studentId) {
      throw new Error('Student ID not found in user data');
    }

    // Get student basic info
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

    // Build query for semester summaries with filters
    let summaryQuery = supabase
      .from('student_semester_summary')
      .select(`
        semester_id,
        total_units_attempted,
        total_units_passed,
        semester_gpa,
        cumulative_gpa,
        academic_semesters!student_semester_summary_semester_id_fkey (
          semester_name,
          academic_sessions!academic_semesters_session_id_fkey (
            session_name
          )
        )
      `)
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false });

    // Apply filters to summary query
    if (input.session_id) {
      summaryQuery = summaryQuery.eq('academic_semesters.session_id', input.session_id);
    }
    if (input.semester_id) {
      summaryQuery = summaryQuery.eq('semester_id', input.semester_id);
    }

    const { data: summaryData, error: summaryError } = await summaryQuery;

    if (summaryError) {
      throw new Error(`Failed to fetch semester summaries: ${summaryError.message}`);
    }

    // Get detailed results for each semester
    const semesterResults = [];
    
    for (const summary of summaryData || []) {
      // Get semester enrollment info to get level
      const { data: enrollmentData } = await supabase
        .from('student_semester_enrollments')
        .select('level')
        .eq('student_id', studentId)
        .eq('semester_id', summary.semester_id)
        .single();

      const level = enrollmentData?.level || 0;
      
      // Apply level filter if specified
      if (input.level && level !== input.level) {
        continue;
      }

      // Get course results for this semester
      const { data: courseResults, error: courseError } = await supabase
        .from('results_new')
        .select(`
          id,
          score,
          grade,
          status,
          created_at,
          student_course_enrollments!inner (
            courses!inner (
              course_code,
              course_title,
              course_unit
            ),
            student_semester_enrollments!inner (
              semester_id
            )
          )
        `)
        .eq('student_course_enrollments.student_semester_enrollments.student_id', studentId)
        .eq('student_course_enrollments.student_semester_enrollments.semester_id', summary.semester_id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (courseError) {
        console.error(`Error fetching course results for semester ${summary.semester_id}:`, courseError);
        continue;
      }

      const courses = (courseResults || []).map(result => {
        const enrollment = (result as any).student_course_enrollments;
        const course = enrollment?.courses;
        
        return {
          result_id: result.id,
          course_code: course?.course_code || '',
          course_title: course?.course_title || '',
          course_unit: course?.course_unit || 0,
          score: result.score,
          grade: result.grade,
          status: result.status,
          created_at: result.created_at
        };
      });

      const semester = (summary as any).academic_semesters;
      const session = semester?.academic_sessions;
      
      semesterResults.push({
        semester_id: summary.semester_id,
        session_name: session?.session_name || 'Unknown',
        semester_name: semester?.semester_name || 'Unknown',
        level: level,
        semester_gpa: summary.semester_gpa,
        total_units_attempted: summary.total_units_attempted || 0,
        total_units_passed: summary.total_units_passed || 0,
        courses
      });
    }

    // Calculate overall academic summary
    const totalUnitsAttempted = summaryData?.reduce((sum, s) => sum + (s.total_units_attempted || 0), 0) || 0;
    const totalUnitsPassed = summaryData?.reduce((sum, s) => sum + (s.total_units_passed || 0), 0) || 0;
    const latestSummary = summaryData?.[0];

    const department = (studentData as any).departments;
    const university = department?.universities;

    return {
      student_info: {
        matric_number: studentData.matric_number,
        full_name: [studentData.first_name, studentData.middle_name, studentData.last_name]
          .filter(Boolean).join(' '),
        department_name: department?.department_name || 'Unknown',
        university_name: university?.university_name || 'Unknown'
      },
      academic_summary: {
        total_semesters: summaryData?.length || 0,
        cumulative_gpa: latestSummary?.cumulative_gpa || null,
        total_units_attempted: totalUnitsAttempted,
        total_units_passed: totalUnitsPassed
      },
      semester_results: semesterResults
    };
  }
});
