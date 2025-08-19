import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Input schemas
const CourseRegistrationQuerySchema = z.object({
  semester_id: z.string().uuid().optional(),
  level: z.number().optional()
});

const CourseRegistrationBodySchema = z.object({
  course_ids: z.array(z.string().uuid()),
  semester_id: z.string().uuid()
});

// Response schemas
const AvailableCoursesSchema = z.object({
  courses: z.array(z.object({
    id: z.string(),
    course_code: z.string(),
    course_title: z.string(),
    course_unit: z.number(),
    level: z.number(),
    semester: z.string(),
    is_enrolled: z.boolean()
  })),
  current_semester: z.object({
    id: z.string(),
    semester_name: z.string(),
    session_name: z.string()
  }).nullable(),
  student_level: z.number().nullable()
});

const RegistrationResponseSchema = z.object({
  success: z.boolean(),
  enrolled_courses: z.array(z.object({
    course_id: z.string(),
    course_code: z.string(),
    course_title: z.string()
  })),
  failed_courses: z.array(z.object({
    course_id: z.string(),
    course_code: z.string(),
    error: z.string()
  }))
});

/**
 * GET /api/student/course-registration
 * Get available courses for registration
 */
export const GET = makeRoute({
  method: 'GET',
  input: CourseRegistrationQuerySchema,
  output: AvailableCoursesSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user, input }) => {
    const studentId = user.user_entity_id;

    // Get student info with department
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        department_id,
        departments!students_department_id_fkey (
          id,
          department_name
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError || !studentData) {
      throw new Error('Student not found');
    }

    // Get current semester or use provided semester_id
    let semesterId = input.semester_id;
    let currentSemester = null;

    if (!semesterId) {
      const { data: currentSemesterData } = await supabase
        .from('academic_semesters')
        .select(`
          id,
          semester_name,
          academic_sessions!academic_semesters_session_id_fkey (
            session_name
          )
        `)
        .eq('is_current', true)
        .single();

      if (currentSemesterData) {
        semesterId = currentSemesterData.id;
        currentSemester = {
          id: currentSemesterData.id,
          semester_name: currentSemesterData.semester_name,
          session_name: (currentSemesterData as any).academic_sessions?.session_name || 'Unknown'
        };
      }
    } else {
      const { data: semesterData } = await supabase
        .from('academic_semesters')
        .select(`
          id,
          semester_name,
          academic_sessions!academic_semesters_session_id_fkey (
            session_name
          )
        `)
        .eq('id', semesterId)
        .single();

      if (semesterData) {
        currentSemester = {
          id: semesterData.id,
          semester_name: semesterData.semester_name,
          session_name: (semesterData as any).academic_sessions?.session_name || 'Unknown'
        };
      }
    }

    // Get student's current level from latest enrollment
    const { data: latestEnrollment } = await supabase
      .from('student_semester_enrollments')
      .select('level')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const studentLevel = input.level || latestEnrollment?.level || 100;

    // Get available courses using the optimized view
    const { data: coursesData, error: coursesError } = await supabase
      .from('student_available_courses')
      .select('*')
      .eq('student_id', studentId)
      .eq('level', studentLevel)
      .order('course_code');

    if (coursesError) {
      throw new Error('Failed to fetch courses');
    }

    // Get existing enrollments for this semester
    let existingEnrollments: any[] = [];
    if (semesterId) {
      const { data: enrollmentData } = await supabase
        .from('student_semester_enrollments')
        .select(`
          id,
          student_course_enrollments!student_course_enrollments_student_semester_enrollment_id_fkey (
            course_id
          )
        `)
        .eq('student_id', studentId)
        .eq('semester_id', semesterId)
        .single();

      if (enrollmentData) {
        existingEnrollments = (enrollmentData as any).student_course_enrollments || [];
      }
    }

    const enrolledCourseIds = new Set(existingEnrollments.map((e: any) => e.course_id));

    const courses = (coursesData || []).map(course => ({
      id: course.course_id,
      course_code: course.course_code,
      course_title: course.course_title,
      course_unit: course.course_unit,
      level: course.level,
      semester: course.semester,
      is_enrolled: enrolledCourseIds.has(course.course_id)
    }));

    return {
      courses,
      current_semester: currentSemester,
      student_level: studentLevel
    };
  }
});

/**
 * POST /api/student/course-registration
 * Register for selected courses
 */
export const POST = makeRoute({
  method: 'POST',
  input: CourseRegistrationBodySchema,
  output: RegistrationResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user, input }) => {
    const studentId = user.user_entity_id;
    const { course_ids, semester_id } = input;

    // Get or create semester enrollment
    let semesterEnrollment;
    const { data: existingEnrollment } = await supabase
      .from('student_semester_enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('semester_id', semester_id)
      .single();

    if (existingEnrollment) {
      semesterEnrollment = existingEnrollment;
    } else {
      // Get student's current level
      const { data: latestEnrollment } = await supabase
        .from('student_semester_enrollments')
        .select('level')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const level = latestEnrollment?.level || 100;

      const { data: newEnrollment, error: enrollmentError } = await supabase
        .from('student_semester_enrollments')
        .insert({
          student_id: studentId,
          semester_id: semester_id,
          level: level,
          enrollment_status: 'registered'
        })
        .select()
        .single();

      if (enrollmentError) {
        throw new Error('Failed to create semester enrollment');
      }

      semesterEnrollment = newEnrollment;
    }

    // Get course details for validation
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .in('id', course_ids);

    if (coursesError) {
      throw new Error('Failed to fetch course details');
    }

    const enrolledCourses: any[] = [];
    const failedCourses: any[] = [];

    // Process each course registration
    for (const courseId of course_ids) {
      const course = coursesData?.find(c => c.id === courseId);
      
      if (!course) {
        failedCourses.push({
          course_id: courseId,
          course_code: 'Unknown',
          error: 'Course not found'
        });
        continue;
      }

      // Check if already enrolled
      const { data: existingCourseEnrollment } = await supabase
        .from('student_course_enrollments')
        .select('id')
        .eq('student_semester_enrollment_id', semesterEnrollment.id)
        .eq('course_id', courseId)
        .single();

      if (existingCourseEnrollment) {
        failedCourses.push({
          course_id: courseId,
          course_code: course.course_code,
          error: 'Already enrolled in this course'
        });
        continue;
      }

      // Create course enrollment
      const { data: courseEnrollment, error: courseEnrollmentError } = await supabase
        .from('student_course_enrollments')
        .insert({
          student_semester_enrollment_id: semesterEnrollment.id,
          course_id: courseId,
          status: 'enrolled'
        })
        .select()
        .single();

      if (courseEnrollmentError) {
        failedCourses.push({
          course_id: courseId,
          course_code: course.course_code,
          error: 'Failed to enroll in course'
        });
      } else {
        enrolledCourses.push({
          course_id: courseId,
          course_code: course.course_code,
          course_title: course.course_title
        });
      }
    }

    return {
      success: failedCourses.length === 0,
      enrolled_courses: enrolledCourses,
      failed_courses: failedCourses
    };
  }
});
