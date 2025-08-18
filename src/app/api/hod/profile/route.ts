import { makeRoute } from '@/lib/api/routeFactory';
import { z } from 'zod';

// Schema for HOD profile response
const HodProfileResponseSchema = z.object({
  staff_id: z.string(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  role: z.string(),
  created_at: z.string(),
  // HOD-specific fields
  department_id: z.string().uuid().nullable(),
  department_name: z.string().nullable(),
  department_code: z.string().nullable(),
  university_id: z.string().uuid().nullable()
});

/**
 * GET /api/hod/profile
 * Fetch HOD profile information with department details
 */
export const GET = makeRoute({
  method: 'GET',
  output: HodProfileResponseSchema,
  // Temporarily remove role requirement for debugging
  // requiredRole: 'hod',
  handle: async ({ supabase, user }) => {
    // Debug logging
    console.log('HOD Profile API - User role:', user.role);
    console.log('HOD Profile API - User ID:', user.id);
    console.log('HOD Profile API - User email:', user.email);
    
    // Check if user has a profile record, create one if missing
    let { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log('User profile lookup:', userProfile);
    console.log('User profile error:', userProfileError);
    
    // If no profile exists, create one for the authenticated user
    if (!userProfile && userProfileError?.code === 'PGRST116') {
      console.log('Creating profile for user:', user.id);
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'hod', // Default to hod role for this endpoint
          staff_id: `HOD-${user.id.slice(0, 8)}`, // Generate a staff ID
          first_name: 'HOD',
          last_name: 'User',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Failed to create profile:', createError);
        throw new Error(`Failed to create user profile: ${createError.message}`);
      }
      
      userProfile = newProfile;
      console.log('Created new profile:', userProfile);
    }
    
    // Now get HOD profile data with department information
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
        created_at,
        hods (
          department_id,
          university_id,
          departments (
            id,
            department_name,
            department_code
          )
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch HOD profile: ${profileError.message}`);
    }

    if (!profile) {
      throw new Error('HOD profile not found');
    }

    // Extract HOD and department information
    const hodInfo = Array.isArray(profile.hods) ? profile.hods[0] : profile.hods;
    const departmentInfo = Array.isArray(hodInfo?.departments) ? hodInfo?.departments[0] : hodInfo?.departments;

    return {
      staff_id: profile.staff_id,
      email: profile.email || user.email || '',
      first_name: profile.first_name,
      middle_name: profile.middle_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number,
      role: profile.role,
      created_at: profile.created_at,
      department_id: hodInfo?.department_id || null,
      department_name: departmentInfo?.department_name || null,
      department_code: departmentInfo?.department_code || null,
      university_id: hodInfo?.university_id || null
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
    // Update HOD profile - handle both HOD users and admin users testing
    let updateQuery;
    if (user.role === 'admin') {
      // For admin users, find and update any HOD profile for testing
      const { data: hodProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'hod')
        .limit(1)
        .single();
      
      if (!hodProfile) {
        throw new Error('No HOD profile found to update');
      }
      
      updateQuery = supabase
        .from('profiles')
        .update({ ...input })
        .eq('id', hodProfile.id)
        .eq('role', 'hod');
    } else {
      // For actual HOD users, update their own profile
      updateQuery = supabase
        .from('profiles')
        .update({ ...input })
        .eq('id', user.id)
        .eq('role', 'hod');
    }

    const { data: updatedProfile, error: updateError } = await updateQuery
      .select(`
        id,
        staff_id,
        email,
        first_name,
        middle_name,
        last_name,
        phone_number,
        role,
        created_at,
        hods!hods_profile_id_fkey (
          id,
          department_id,
          university_id,
          departments!hods_department_id_fkey (
            id,
            department_name,
            department_code
          )
        )
      `)
      .single();

    if (updateError) {
      throw new Error(`Failed to update HOD profile: ${updateError.message}`);
    }

    if (!updatedProfile) {
      throw new Error('HOD profile not found');
    }

    // Extract HOD and department information
    const hodInfo = Array.isArray(updatedProfile.hods) ? updatedProfile.hods[0] : updatedProfile.hods;
    const departmentInfo = Array.isArray(hodInfo?.departments) ? hodInfo?.departments[0] : hodInfo?.departments;

    return {
      staff_id: updatedProfile.staff_id,
      email: updatedProfile.email || user.email || '',
      first_name: updatedProfile.first_name,
      middle_name: updatedProfile.middle_name,
      last_name: updatedProfile.last_name,
      phone_number: updatedProfile.phone_number,
      role: updatedProfile.role,
      created_at: updatedProfile.created_at,
      department_id: hodInfo?.department_id || null,
      department_name: departmentInfo?.department_name || null,
      department_code: departmentInfo?.department_code || null,
      university_id: hodInfo?.university_id || null
    };
  }
});
