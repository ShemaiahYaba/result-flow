import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Schema for HOD with profile and department data
const HodSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  department_id: z.string().uuid(),
  university_id: z.string().uuid(),
  created_at: z.string(),
  // Profile data
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string().email(),
  staff_id: z.string(),
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
  handle: async ({ supabase }) => {
    // Fetch HODs with their profile and department information
    const { data: hodsData, error } = await supabase
      .from('hods')
      .select(`
        id,
        profile_id,
        department_id,
        university_id,
        created_at,
        profiles!hods_profile_id_fkey (
          id,
          first_name,
          last_name,
          email,
          staff_id
        ),
        departments!hods_department_id_fkey (
          id,
          department_name,
          department_code
        )
      `);

    if (error) {
      throw new Error(`Failed to fetch HODs: ${error.message}`);
    }

    if (!hodsData) {
      return [];
    }

    // Transform the data to match frontend expectations
    const transformedData = hodsData.map((hod: any) => {
      const profile = hod.profiles;
      const department = hod.departments;
      
      // Construct full name
      const firstName = profile?.first_name || '';
      const lastName = profile?.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim() || profile?.email || 'Unknown';

      return {
        id: hod.id,
        profile_id: hod.profile_id,
        department_id: hod.department_id,
        university_id: hod.university_id,
        created_at: hod.created_at,
        // Profile fields
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        email: profile?.email || '',
        staff_id: profile?.staff_id || '',
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
