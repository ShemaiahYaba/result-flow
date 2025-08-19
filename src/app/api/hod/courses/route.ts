import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * GET /api/hod/courses
 * Get courses dropdown list for HOD's department
 */
const CourseSchema = z.object({
  course_id: z.string(),
  course_code: z.string(),
  course_title: z.string(),
  level: z.number(),
  semester: z.string(),
  course_unit: z.number()
});

const HodCoursesResponseSchema = z.array(CourseSchema);

export const GET = makeRoute({
  method: 'GET',
  output: HodCoursesResponseSchema,
  requiredRole: 'hod',
  handle: async ({ supabase, user }) => {
    // Get courses for HOD's department using the database view
    const { data: courses, error: coursesError } = await supabase
      .from('hod_courses_dropdown')
      .select('*')
      .eq('hod_id', user.user_entity_id);

    if (coursesError) {
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    return courses || [];
  }
});
