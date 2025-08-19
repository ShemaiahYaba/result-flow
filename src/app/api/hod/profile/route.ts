import { makeRoute } from '@/lib/api/routeFactory';
import { z } from 'zod';

// Schema for HOD profile response
const HodProfileResponseSchema = z.object({
  staff_id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  middle_name: z.string().nullable(),
  last_name: z.string(),
  phone_number: z.string().nullable(),
  role: z.string(),
  created_at: z.string(),
  // HOD-specific fields
  department_id: z.string().uuid(),
  department_name: z.string(),
  department_code: z.string(),
  university_id: z.string().uuid()
});

/**
 * GET /api/hod/profile
 * Fetch HOD profile information with department details
 */
export const GET = makeRoute({
  method: 'GET',
  output: HodProfileResponseSchema,
  requiredRole: 'hod',
  handle: async ({ supabase, user }) => {
    // Get HOD entity ID from users table
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    // Get HOD profile data with department information
    const { data: hodProfile, error: profileError } = await supabase
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
      .eq('id', userData.user_entity_id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch HOD profile: ${profileError.message}`);
    }

    if (!hodProfile) {
      throw new Error('HOD profile not found');
    }

    const department = Array.isArray(hodProfile.departments) 
      ? hodProfile.departments[0] 
      : hodProfile.departments;

    return {
      staff_id: hodProfile.staff_id,
      email: hodProfile.email,
      first_name: hodProfile.first_name,
      middle_name: hodProfile.middle_name,
      last_name: hodProfile.last_name,
      phone_number: hodProfile.phone_number,
      role: 'hod',
      created_at: hodProfile.created_at,
      department_id: hodProfile.department_id,
      department_name: (department as any)?.department_name || '',
      department_code: (department as any)?.department_code || '',
      university_id: (department as any)?.university_id || ''
    };
  }
});

/**
 * PATCH /api/hod/profile
 * Update HOD profile information
 */
const UpdateHodProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  middle_name: z.string().optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone_number: z.string().optional()
  // staff_id is intentionally excluded - it's read-only and tied to authentication
  // department_id is also excluded - HOD department assignments should be managed separately
});

export const PATCH = makeRoute({
  method: 'PATCH',
  input: UpdateHodProfileSchema,
  output: HodProfileResponseSchema,
  requiredRole: 'hod',
  handle: async ({ supabase, user, input }) => {
    // Get HOD entity ID from users table
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    // Update HOD profile in the hods table
    const { data: updatedProfile, error: updateError } = await supabase
      .from('hods')
      .update({ ...input })
      .eq('id', userData.user_entity_id)
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
      .single();

    if (updateError) {
      throw new Error(`Failed to update HOD profile: ${updateError.message}`);
    }

    if (!updatedProfile) {
      throw new Error('HOD profile not found');
    }

    const department = Array.isArray(updatedProfile.departments) 
      ? updatedProfile.departments[0] 
      : updatedProfile.departments;

    return {
      staff_id: updatedProfile.staff_id,
      email: updatedProfile.email,
      first_name: updatedProfile.first_name,
      middle_name: updatedProfile.middle_name,
      last_name: updatedProfile.last_name,
      phone_number: updatedProfile.phone_number,
      role: 'hod',
      created_at: updatedProfile.created_at,
      department_id: updatedProfile.department_id,
      department_name: (department as any)?.department_name || '',
      department_code: (department as any)?.department_code || '',
      university_id: (department as any)?.university_id || ''
    };
  }
});
