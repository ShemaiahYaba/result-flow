import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Input schemas
const CreateCourseOfferingSchema = z.object({
  course_id: z.string().uuid(),
  semester_id: z.string().uuid(),
  max_enrollment: z.number().optional(),
  registration_open: z.boolean().optional().default(true)
});

const UpdateCourseOfferingSchema = z.object({
  id: z.string().uuid(),
  max_enrollment: z.number().optional(),
  registration_open: z.boolean().optional(),
  registration_start_date: z.string().optional(),
  registration_end_date: z.string().optional()
});

// Response schemas
const CourseOfferingSchema = z.object({
  id: z.string(),
  course_id: z.string(),
  course_code: z.string(),
  course_title: z.string(),
  semester_id: z.string(),
  semester_name: z.string(),
  max_enrollment: z.number().nullable(),
  current_enrollment: z.number(),
  registration_open: z.boolean(),
  registration_start_date: z.string().nullable(),
  registration_end_date: z.string().nullable()
});

const CourseOfferingsResponseSchema = z.array(CourseOfferingSchema);

/**
 * GET /api/hod/course-offerings
 * Get course offerings for HOD's department
 */
export const GET = makeRoute({
  method: 'GET',
  output: CourseOfferingsResponseSchema,
  requiredRole: 'hod',
  handle: async ({ supabase, user }) => {
    const hodId = user.user_entity_id;

    // Get HOD's department
    const { data: hodData, error: hodError } = await supabase
      .from('hods')
      .select('department_id')
      .eq('id', hodId)
      .single();

    if (hodError || !hodData) {
      throw new Error('HOD not found');
    }

    // Get course offerings for the department
    const { data: offerings, error: offeringsError } = await supabase
      .from('course_offerings')
      .select(`
        id,
        course_id,
        semester_id,
        max_enrollment,
        current_enrollment,
        registration_open,
        registration_start_date,
        registration_end_date,
        courses!course_offerings_course_id_fkey (
          course_code,
          course_title
        ),
        academic_semesters!course_offerings_semester_id_fkey (
          semester_name,
          academic_sessions!academic_semesters_session_id_fkey (
            session_name
          )
        )
      `)
      .eq('courses.department_id', hodData.department_id)
      .order('courses.course_code');

    if (offeringsError) {
      throw new Error(`Failed to fetch course offerings: ${offeringsError.message}`);
    }

    return (offerings || []).map((offering: any) => ({
      id: offering.id,
      course_id: offering.course_id,
      course_code: offering.courses?.course_code || '',
      course_title: offering.courses?.course_title || '',
      semester_id: offering.semester_id,
      semester_name: offering.academic_semesters?.semester_name || '',
      max_enrollment: offering.max_enrollment,
      current_enrollment: offering.current_enrollment,
      registration_open: offering.registration_open,
      registration_start_date: offering.registration_start_date,
      registration_end_date: offering.registration_end_date
    }));
  }
});

/**
 * POST /api/hod/course-offerings
 * Create new course offering
 */
export const POST = makeRoute({
  method: 'POST',
  input: CreateCourseOfferingSchema,
  output: z.object({ success: z.boolean(), offering_id: z.string() }),
  requiredRole: 'hod',
  handle: async ({ supabase, user, input }) => {
    const hodId = user.user_entity_id;

    // Verify HOD can manage this course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        department_id,
        departments!courses_department_id_fkey (
          hods!hods_department_id_fkey (
            id
          )
        )
      `)
      .eq('id', input.course_id)
      .single();

    if (courseError || !courseData) {
      throw new Error('Course not found');
    }

    const hodIds = (courseData as any).departments?.hods?.map((h: any) => h.id) || [];
    if (!hodIds.includes(hodId)) {
      throw new Error('Not authorized to manage this course');
    }

    // Create course offering
    const { data: offering, error: offeringError } = await supabase
      .from('course_offerings')
      .insert({
        course_id: input.course_id,
        semester_id: input.semester_id,
        max_enrollment: input.max_enrollment,
        registration_open: input.registration_open
      })
      .select()
      .single();

    if (offeringError) {
      throw new Error(`Failed to create course offering: ${offeringError.message}`);
    }

    return {
      success: true,
      offering_id: offering.id
    };
  }
});

/**
 * PATCH /api/hod/course-offerings
 * Update course offering
 */
export const PATCH = makeRoute({
  method: 'PATCH',
  input: UpdateCourseOfferingSchema,
  output: z.object({ success: z.boolean() }),
  requiredRole: 'hod',
  handle: async ({ supabase, user, input }) => {
    const hodId = user.user_entity_id;

    // Verify HOD can manage this offering
    const { data: offeringData, error: offeringError } = await supabase
      .from('course_offerings')
      .select(`
        id,
        courses!course_offerings_course_id_fkey (
          department_id,
          departments!courses_department_id_fkey (
            hods!hods_department_id_fkey (
              id
            )
          )
        )
      `)
      .eq('id', input.id)
      .single();

    if (offeringError || !offeringData) {
      throw new Error('Course offering not found');
    }

    const hodIds = (offeringData as any).courses?.departments?.hods?.map((h: any) => h.id) || [];
    if (!hodIds.includes(hodId)) {
      throw new Error('Not authorized to manage this course offering');
    }

    // Update course offering
    const updateData: any = {};
    if (input.max_enrollment !== undefined) updateData.max_enrollment = input.max_enrollment;
    if (input.registration_open !== undefined) updateData.registration_open = input.registration_open;
    if (input.registration_start_date !== undefined) updateData.registration_start_date = input.registration_start_date;
    if (input.registration_end_date !== undefined) updateData.registration_end_date = input.registration_end_date;

    const { error: updateError } = await supabase
      .from('course_offerings')
      .update(updateData)
      .eq('id', input.id);

    if (updateError) {
      throw new Error(`Failed to update course offering: ${updateError.message}`);
    }

    return { success: true };
  }
});
