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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
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
      .eq('id', user.id)
      .eq('role', 'admin')
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch admin profile: ${profileError.message}`);
    }

    if (!profile) {
      throw new Error('Admin profile not found');
    }

    return {
      staff_id: profile.staff_id,
      email: profile.email || user.email || '',
      first_name: profile.first_name,
      middle_name: profile.middle_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
      role: profile.role,
      created_at: profile.created_at,
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
