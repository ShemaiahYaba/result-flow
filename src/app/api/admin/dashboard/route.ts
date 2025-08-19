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
        .eq('auth_user_id', user.id)
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

      // Fetch departments for this university first
      const { data: universityDepts, error: deptFetchError } = await supabase
        .from('departments')
        .select('id')
        .eq('university_id', adminData.university_id);

      if (deptFetchError) {
        throw new Error(`Failed to fetch departments: ${deptFetchError.message}`);
      }

      const departmentIds = universityDepts?.map(d => d.id) || [];

      // Fetch total HODs count for admin's university departments
      const { count: hodsCount, error: hodsError } = await supabase
        .from('hods')
        .select('*', { count: 'exact', head: true })
        .in('department_id', departmentIds);

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

      // Fetch courses count for admin's university (courses are linked via departments)
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .in('department_id', departmentIds);

      const totalCourses = coursesError ? 0 : (coursesCount || 0);

      // Fetch pending results approvals for admin's university using the admin_pending_approvals view
      const { count: pendingCount, error: pendingError } = await supabase
        .from('admin_pending_approvals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted')
        .eq('admin_id', userData.user_entity_id);

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
