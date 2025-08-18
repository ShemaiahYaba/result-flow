import { makeRoute } from '@/lib/api/routeFactory';
import { 
  StudentProfileResponseSchema, 
  UpdateProfileRequestSchema,
  MessageResponseSchema 
} from '@/schemas/student/api';

/**
 * GET /api/student/profile
 * Fetch student's profile details
 */
export const GET = makeRoute({
  method: 'GET',
  output: StudentProfileResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user }) => {
    // Get student profile with department info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        firstname,
        middlename,
        lastname,
        email,
        phone_number,
        department_id,
        departments(
          department_name
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Get student record for level and matric_number
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        matric_number,
        level
      `)
      .eq('profile_id', user.id)
      .single();

    if (studentError) throw studentError;

    return {
      id: profile.id,
      firstname: profile.firstname,
      middlename: profile.middlename,
      lastname: profile.lastname,
      email: profile.email,
      phone_number: profile.phone_number,
      department: profile.departments?.[0]?.department_name || '',
      department_id: profile.department_id,
      matric_number: student.matric_number,
      level: student.level,
      role: profile.role
    };
  }
});

/**
 * PATCH /api/student/profile
 * Update student's profile information
 */
export const PATCH = makeRoute({
  method: 'PATCH',
  input: UpdateProfileRequestSchema,
  output: MessageResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user, input }) => {
    // Update profile table
    const { error } = await supabase
      .from('profiles')
      .update({
        ...(input.firstname && { firstname: input.firstname }),
        ...(input.middlename && { middlename: input.middlename }),
        ...(input.lastname && { lastname: input.lastname }),
        ...(input.email && { email: input.email }),
        ...(input.phone_number && { phone_number: input.phone_number }),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    // If fullname was updated, also update students table
    if (input.firstname || input.middlename || input.lastname) {
      const { error: studentError } = await supabase
        .from('profiles')
        .update({
          fullname: input.firstname + ' ' + input.middlename + ' ' + input.lastname,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (studentError) throw studentError;
    }

    return {
      message: 'Profile updated successfully'
    };
  },
  onSuccessNotify: async (result) => {
    console.log('Student profile updated successfully');
  }
});
