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
  university_id: z.string().uuid().nullable(),
  hod: z.object({
    id: z.string().uuid(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    email: z.string().email()
  }).nullable()
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
    // Get all departments with their HOD information
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select(`
        id,
        department_name,
        department_code,
        created_at,
        university_id,
        hods!hods_department_id_fkey (
          id,
          profiles!hods_profile_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .order('department_name', { ascending: true });

    if (departmentsError) {
      throw new Error(`Failed to fetch departments: ${departmentsError.message}`);
    }

    // Transform the data to match our schema
    const transformedDepartments = (departments || []).map(dept => ({
      id: dept.id,
      department_name: dept.department_name,
      department_code: dept.department_code,
      created_at: dept.created_at,
      university_id: dept.university_id,
      hod: dept.hods && dept.hods.length > 0 && dept.hods[0].profiles 
        ? {
            id: dept.hods[0].profiles[0].id,
            first_name: dept.hods[0].profiles[0].first_name,
            last_name: dept.hods[0].profiles[0].last_name,
            email: dept.hods[0].profiles[0].email
          }
        : null
    }));

    return transformedDepartments;
  }
});
