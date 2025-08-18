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
  handle: async ({ supabase }) => {
    try {
      // Fetch total HODs count
      const { count: hodsCount, error: hodsError } = await supabase
        .from('hods')
        .select('*', { count: 'exact', head: true });

      if (hodsError) {
        throw new Error(`Failed to fetch HODs count: ${hodsError.message}`);
      }

      // Fetch departments count
      const { count: departmentsCount, error: deptError } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });

      if (deptError) {
        throw new Error(`Failed to fetch departments count: ${deptError.message}`);
      }

      // Fetch courses count (assuming courses table exists)
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // If courses table doesn't exist, default to 0
      const totalCourses = coursesError ? 0 : (coursesCount || 0);

      // For pending approvals, we'll need to check what table/logic applies
      // For now, using a placeholder - this should be updated based on your approval system
      const pendingApprovals = 0; // TODO: Implement based on your approval workflow

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
