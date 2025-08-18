import { makeRoute } from '@/lib/api/routeFactory';
import { z } from 'zod';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const DepartmentSchema = z.object({
  id: z.string().uuid(),
  department_name: z.string(),
  department_code: z.string(),
  created_at: z.string(),
  university_id: z.string().uuid().nullable()
});

const DepartmentsListResponseSchema = z.array(DepartmentSchema);

/**
 * GET /api/admin/departments
 * Fetch all departments with department_name, department_code, and university_id
 */
export const GET = makeRoute({
  method: 'GET',
  output: DepartmentsListResponseSchema,
  requiredRole: 'admin',
  handle: async ({ supabase, user }) => {
    // Get all departments from database
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select(`
        id,
        department_name,
        department_code,
        created_at,
        university_id
      `)
      .order('department_name', { ascending: true });

    if (departmentsError) {
      throw new Error(`Failed to fetch departments: ${departmentsError.message}`);
    }

    return departments || [];
  }
});
