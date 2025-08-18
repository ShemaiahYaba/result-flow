import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Schema for dashboard stats
const DashboardStatsSchema = z.object({
  totalHods: z.number(),
  departments: z.number(),
  courses: z.number(),
  pendingApprovals: z.number()
});

export const GET = makeRoute({
  method: 'GET',
  requiredRole: 'admin',
  output: DashboardStatsSchema,
  handle: async ({ supabase, user }) => {
    try {
      // Get admin's university to filter data
      const { data: userData } = await supabase
        .from('users')
        .select('user_entity_id')
        .eq('id', user.id)
        .single();

      if (!userData) {
        throw new Error('User not found');
      }

      const { data: adminData } = await supabase
        .from('admins')
        .select('university_id')
        .eq('id', userData.user_entity_id)
        .single();

      if (!adminData) {
        throw new Error('Admin not found');
      }

      // Fetch total HODs count for admin's university
      const { count: hodsCount, error: hodsError } = await supabase
        .from('hods')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', adminData.university_id);

      if (hodsError) {
        throw new Error(`Failed to fetch HODs count: ${hodsError.message}`);
      }

      // Fetch departments count for admin's university
      const { count: departmentsCount, error: deptError } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', adminData.university_id);

      if (deptError) {
        throw new Error(`Failed to fetch departments count: ${deptError.message}`);
      }

      // Fetch courses count for admin's university
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('university_id', adminData.university_id);

      const totalCourses = coursesError ? 0 : (coursesCount || 0);

      // Fetch pending results approvals for admin's university
      // First get course IDs for the university
      const { data: universityCourses } = await supabase
        .from('courses')
        .select('id')
        .eq('university_id', adminData.university_id);

      const courseIds = universityCourses?.map(course => course.id) || [];

      // Then get enrollment IDs for those courses
      const { data: enrollments } = await supabase
        .from('student_course_enrollments')
        .select('id')
        .in('course_id', courseIds);

      const enrollmentIds = enrollments?.map(enrollment => enrollment.id) || [];

      // Finally count pending results for those enrollments
      const { count: pendingCount, error: pendingError } = await supabase
        .from('results_new')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('student_course_enrollment_id', enrollmentIds);

      const pendingApprovals = pendingError ? 0 : (pendingCount || 0);

      return {
        totalHods: hodsCount || 0,
        departments: departmentsCount || 0,
        courses: totalCourses,
        pendingApprovals: pendingApprovals
      };

    } catch (error: any) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }
});
