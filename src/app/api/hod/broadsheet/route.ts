import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

const BroadsheetStudentSchema = z.object({
  student_id: z.string(),
  matric_number: z.string(),
  full_name: z.string(),
  level: z.number(),
  gpa: z.number().nullable(),
  course_scores: z.record(z.string(), z.number().nullable())
});

const BroadsheetResponseSchema = z.object({
  semester_info: z.object({
    semester_id: z.string(),
    semester_name: z.string(),
    academic_year: z.string()
  }),
  department_info: z.object({
    department_name: z.string(),
    department_code: z.string()
  }),
  courses: z.array(z.object({
    course_id: z.string(),
    course_code: z.string(),
    course_title: z.string(),
    course_unit: z.number()
  })),
  students: z.array(BroadsheetStudentSchema),
  summary: z.object({
    total_students: z.number(),
    students_with_results: z.number(),
    average_gpa: z.number().nullable()
  })
});

export const GET = makeRoute({
  method: 'GET',
  output: BroadsheetResponseSchema,
  requiredRole: 'hod',
  handle: async ({ req, supabase, user }) => {
    const url = new URL(req.url);
    const semester_id = url.searchParams.get('semester_id');
    const level = url.searchParams.get('level');

    if (!semester_id) {
      throw new Error('Semester ID is required');
    }

    // Get HOD department info
    const { data: hodData, error: hodError } = await supabase
      .from('hods')
      .select(`
        department_id,
        departments (
          department_name,
          department_code
        )
      `)
      .eq('id', user.user_entity_id)
      .single();

    if (hodError || !hodData) {
      throw new Error('HOD not found');
    }

    // Get semester info
    const { data: semesterData, error: semesterError } = await supabase
      .from('academic_semesters')
      .select(`
        *,
        academic_sessions!inner(
          session_name,
          start_date,
          end_date
        )
      `)
      .eq('id', semester_id)
      .single();

    if (semesterError || !semesterData) {
      throw new Error('Semester not found');
    }

    // Get department courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, course_code, course_title, course_unit')
      .eq('department_id', hodData.department_id)
      .order('course_code');

    if (coursesError) {
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    // Build query for students with enrollments
    let studentsQuery = supabase
      .from('student_semester_enrollments')
      .select(`
        id,
        level,
        student_id,
        students (
          id,
          matric_number,
          first_name,
          middle_name,
          last_name
        )
      `)
      .eq('semester_id', semester_id)
      .eq('students.department_id', hodData.department_id);

    if (level) {
      studentsQuery = studentsQuery.eq('level', parseInt(level));
    }

    const { data: studentsData, error: studentsError } = await studentsQuery
      .order('students(matric_number)');

    if (studentsError) {
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    // Get student semester summaries separately
    const studentIds = studentsData?.map((s: any) => s.student_id) || [];
    const { data: summaryData, error: summaryError } = await supabase
      .from('student_semester_summary')
      .select('student_id, semester_gpa')
      .eq('semester_id', semester_id)
      .in('student_id', studentIds);

    if (summaryError) {
      throw new Error(`Failed to fetch student summaries: ${summaryError.message}`);
    }

    // Get student course enrollments for this semester
    const enrollmentIds = studentsData?.map((s: any) => s.id) || [];
    
    const { data: courseEnrollments, error: enrollmentError } = await supabase
      .from('student_course_enrollments')
      .select(`
        id,
        course_id,
        student_semester_enrollment_id,
        results_new (
          score,
          status
        )
      `)
      .in('student_semester_enrollment_id', enrollmentIds);

    if (enrollmentError) {
      throw new Error(`Failed to fetch course enrollments: ${enrollmentError.message}`);
    }

    // Process data into broadsheet format
    const students = (studentsData || []).map((enrollment: any) => {
      const student = enrollment.students;
      const fullName = [student.first_name, student.middle_name, student.last_name]
        .filter(Boolean)
        .join(' ');

      // Build course scores object
      const courseScores: Record<string, number | null> = {};
      (courses || []).forEach((course: any) => {
        const courseEnrollment = (courseEnrollments || []).find((ce: any) => 
          ce.student_semester_enrollment_id === enrollment.id &&
          ce.course_id === course.id
        );
        
        const result = courseEnrollment?.results_new?.[0];
        courseScores[course.course_code] = (result?.status === 'approved') ? result.score : null;
      });

      // Get GPA from semester summary
      const summary = summaryData?.find((s: any) => s.student_id === enrollment.student_id);
      const gpa = summary?.semester_gpa || null;

      return {
        student_id: student.id,
        matric_number: student.matric_number,
        full_name: fullName,
        level: enrollment.level,
        gpa: gpa,
        course_scores: courseScores
      };
    });

    // Calculate summary statistics
    const studentsWithResults = students.filter((s: any) => 
      Object.values(s.course_scores).some(score => score !== null)
    ).length;

    const validGpas = students.map((s: any) => s.gpa).filter(gpa => gpa !== null) as number[];
    const averageGpa = validGpas.length > 0 
      ? validGpas.reduce((sum, gpa) => sum + gpa, 0) / validGpas.length 
      : null;

    return {
      semester_info: {
        semester_id: semesterData.id,
        semester_name: semesterData.semester_name,
        academic_year: (semesterData as any).academic_sessions.session_name
      },
      department_info: {
        department_name: (hodData as any).departments?.department_name || 'Unknown',
        department_code: (hodData as any).departments?.department_code || 'Unknown'
      },
      courses: (courses || []).map((course: any) => ({
        course_id: course.id,
        course_code: course.course_code,
        course_title: course.course_title,
        course_unit: course.course_unit
      })),
      students,
      summary: {
        total_students: students.length,
        students_with_results: studentsWithResults,
        average_gpa: averageGpa
      }
    };
  }
});
