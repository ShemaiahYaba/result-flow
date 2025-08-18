import { makeRoute } from '@/lib/api/routeFactory';
import { z } from 'zod';

// Schema for admin profile response
const AdminProfileResponseSchema = z.object({
  staff_id: z.string(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  role: z.string(),
  created_at: z.string()
});

/**
 * GET /api/admin/profile
 * Fetch admin profile information
 */
export const GET = makeRoute({
  method: 'GET',
  output: AdminProfileResponseSchema,
  requiredRole: 'admin',
  handle: async ({ supabase, user }) => {
    // Get admin profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        user_entity_id,
        role_id
      `)
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    // Fetch role separately to avoid join issues
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role_name')
      .eq('id', userData.role_id)
      .single();

    if (roleError || !roleData) {
      throw new Error('User role not found');
    }

    const { data: adminProfile, error: profileError } = await supabase
      .from('admins')
      .select(`
        id,
        admin_id,
        email,
        first_name,
        middle_name,
        last_name,
        phone_number,
        created_at
      `)
      .eq('id', userData.user_entity_id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch admin profile: ${profileError.message}`);
    }

    if (!adminProfile) {
      throw new Error('Admin profile not found');
    }

    return {
      staff_id: adminProfile.admin_id,
      email: adminProfile.email || user.email || '',
      first_name: adminProfile.first_name,
      middle_name: adminProfile.middle_name,
      last_name: adminProfile.last_name,
      phone_number: adminProfile.phone_number,
      role: roleData.role_name,
      created_at: adminProfile.created_at,
    };
  }
});

/**
 * PATCH /api/admin/profile
 * Update admin profile information
 */
const UpdateAdminProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  middle_name: z.string().optional(),
  last_name: z.string().min(1).optional(),
  phone_number: z.string().optional()
  // staff_id is intentionally excluded - it's read-only and tied to authentication
});

export const PATCH = makeRoute({
  method: 'PATCH',
  input: UpdateAdminProfileSchema,
  output: AdminProfileResponseSchema,
  requiredRole: 'admin',
  handle: async ({ supabase, user, input }) => {
    // Update admin profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...input,
      })
      .eq('id', user.id)
      .eq('role', 'admin')
      .select(`
        id,
        staff_id,
        email,
        first_name,
        middle_name,
        last_name,
        phone_number,
        role,
        created_at
      `)
      .single();

    if (updateError) {
      throw new Error(`Failed to update admin profile: ${updateError.message}`);
    }

    if (!updatedProfile) {
      throw new Error('Admin profile not found');
    }

    return {
      staff_id: updatedProfile.staff_id,
      email: updatedProfile.email || user.email || '',
      first_name: updatedProfile.first_name,
      middle_name: updatedProfile.middle_name,
      last_name: updatedProfile.last_name,
      phone_number: updatedProfile.phone_number,
      role: updatedProfile.role,
      created_at: updatedProfile.created_at,
    };
  }
});
