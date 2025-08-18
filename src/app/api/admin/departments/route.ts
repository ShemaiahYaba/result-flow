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
  university_id: z.string().uuid(),
  hod: z.object({
    id: z.string().uuid(),
    staff_id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email()
  }).nullable()
});

const DepartmentsListResponseSchema = z.array(DepartmentSchema);

/**
 * GET /api/admin/departments
 * Fetch departments for admin's university with HOD information
 */
export const GET = makeRoute({
  method: 'GET',
  output: DepartmentsListResponseSchema,
  requiredRole: 'admin',
  handle: async ({ supabase, user }) => {
    // Get admin's university to filter departments
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

    // Get departments for admin's university with their HOD information
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
          staff_id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('university_id', adminData.university_id)
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
      hod: dept.hods && dept.hods.length > 0 
        ? {
            id: dept.hods[0].id,
            staff_id: dept.hods[0].staff_id,
            first_name: dept.hods[0].first_name,
            last_name: dept.hods[0].last_name,
            email: dept.hods[0].email
          }
        : null
    }));

    return transformedDepartments;
  }
});
