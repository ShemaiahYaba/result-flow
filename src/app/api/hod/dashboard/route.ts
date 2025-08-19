import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * GET /api/hod/dashboard
 * Get HOD dashboard statistics
 */
const HodDashboardResponseSchema = z.object({
  registeredStudents: z.number(),
  departmentalCourses: z.number(),
  department: z.string(),
  departmentCode: z.string(),
  university: z.string(),
  hodName: z.string(),
  staffId: z.string()
});

export const GET = makeRoute({
  method: 'GET',
  output: HodDashboardResponseSchema,
  requiredRole: 'hod',
  handle: async ({ supabase, user }) => {
    // Get HOD dashboard data using the database view
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('hod_dashboard_view')
      .select('*')
      .eq('hod_id', user.user_entity_id)
      .single();

    if (dashboardError) {
      throw new Error(`Failed to fetch HOD dashboard data: ${dashboardError.message}`);
    }

    if (!dashboardData) {
      throw new Error('HOD dashboard data not found');
    }

    return {
      registeredStudents: dashboardData.registered_students || 0,
      departmentalCourses: dashboardData.departmental_courses || 0,
      department: dashboardData.department_name || '',
      departmentCode: dashboardData.department_code || '',
      university: dashboardData.university_name || '',
      hodName: dashboardData.hod_name || '',
      staffId: dashboardData.staff_id || ''
    };
  }
});
