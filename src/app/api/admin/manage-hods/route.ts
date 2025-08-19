import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Schema for HOD with new schema structure
const HodSchema = z.object({
  id: z.string().uuid(),
  staff_id: z.string(),
  department_id: z.string().uuid(),
  university_id: z.string().uuid(),
  created_at: z.string(),
  // Personal data
  first_name: z.string(),
  middle_name: z.string().nullable(),
  last_name: z.string(),
  email: z.string().email(),
  phone_number: z.string().nullable(),
  // Department data
  department_name: z.string(),
  department_code: z.string(),
  // Computed fields for frontend
  name: z.string(),
  status: z.string()
});

const HodsResponseSchema = z.array(HodSchema);

export const GET = makeRoute({
  method: 'GET',
  requiredRole: 'admin',
  output: HodsResponseSchema,
  handle: async ({ supabase, user }) => {
    // Get admin's university to filter HODs
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

    // Get departments for admin's university first
    const { data: universityDepts, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('university_id', adminData.university_id);

    if (deptError) {
      throw new Error(`Failed to fetch departments: ${deptError.message}`);
    }

    const departmentIds = universityDepts?.map(d => d.id) || [];

    // Fetch HODs with their department information for admin's university
    const { data: hodsData, error } = await supabase
      .from('hods')
      .select(`
        id,
        staff_id,
        first_name,
        middle_name,
        last_name,
        email,
        phone_number,
        department_id,
        created_at,
        departments!hods_department_id_fkey (
          id,
          department_name,
          department_code,
          university_id
        )
      `)
      .in('department_id', departmentIds);

    if (error) {
      throw new Error(`Failed to fetch HODs: ${error.message}`);
    }

    if (!hodsData) {
      return [];
    }

    // Transform the data to match frontend expectations
    const transformedData = hodsData.map((hod: any) => {
      const department = hod.departments;
      
      // Construct full name
      const firstName = hod.first_name || '';
      const middleName = hod.middle_name ? ` ${hod.middle_name}` : '';
      const lastName = hod.last_name || '';
      const fullName = `${firstName}${middleName} ${lastName}`.trim() || hod.email || 'Unknown';

      return {
        id: hod.id,
        staff_id: hod.staff_id,
        department_id: hod.department_id,
        university_id: department?.university_id || adminData.university_id,
        created_at: hod.created_at,
        // Personal fields
        first_name: hod.first_name,
        middle_name: hod.middle_name,
        last_name: hod.last_name,
        email: hod.email,
        phone_number: hod.phone_number,
        // Department fields
        department_name: department?.department_name || '',
        department_code: department?.department_code || '',
        // Frontend expected fields
        name: fullName,
        status: 'Active' // Default status, can be enhanced later
      };
    });

    return transformedData;
  }
});
