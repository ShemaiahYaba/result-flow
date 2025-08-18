import { makeRoute } from '@/lib/api/routeFactory';
import { z } from 'zod';

// Schema for student profile response with new schema structure
const StudentProfileResponseSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  middle_name: z.string().nullable(),
  last_name: z.string(),
  email: z.string().email(),
  phone_number: z.string().nullable(),
  department_name: z.string(),
  department_id: z.string().uuid(),
  matric_number: z.string(),
  university_id: z.string().uuid(),
  role: z.string(),
  created_at: z.string()
});

/**
 * GET /api/student/profile
 * Fetch student's profile details
 */
export const GET = makeRoute({
  method: 'GET',
  output: StudentProfileResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user }) => {
    // Get student entity ID from users table
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    // Get student profile with department info from new schema
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        email,
        phone_number,
        matric_number,
        department_id,
        created_at,
        departments!students_department_id_fkey (
          id,
          department_name,
          university_id
        )
      `)
      .eq('id', userData.user_entity_id)
      .single();

    if (studentError) {
      throw new Error(`Failed to fetch student profile: ${studentError.message}`);
    }

    if (!student) {
      throw new Error('Student profile not found');
    }

    const department = Array.isArray(student.departments) 
      ? student.departments[0] 
      : student.departments;

    return {
      id: student.id,
      first_name: student.first_name,
      middle_name: student.middle_name,
      last_name: student.last_name,
      email: student.email,
      phone_number: student.phone_number,
      department_name: (department as any)?.department_name || '',
      department_id: student.department_id,
      matric_number: student.matric_number,
      university_id: (department as any)?.university_id || '',
      role: 'student',
      created_at: student.created_at
    };
  }
});

// Schema for updating student profile
const UpdateStudentProfileSchema = z.object({
  first_name: z.string().min(1).optional(),
  middle_name: z.string().optional(),
  last_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone_number: z.string().optional()
  // matric_number is read-only and tied to authentication
});

const MessageResponseSchema = z.object({
  message: z.string()
});

/**
 * PATCH /api/student/profile
 * Update student's profile information
 */
export const PATCH = makeRoute({
  method: 'PATCH',
  input: UpdateStudentProfileSchema,
  output: MessageResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, user, input }) => {
    // Get student entity ID from users table
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    // Update student profile in the students table
    const { error } = await supabase
      .from('students')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.user_entity_id);

    if (error) {
      throw new Error(`Failed to update student profile: ${error.message}`);
    }

    return {
      message: 'Profile updated successfully'
    };
  },
  onSuccessNotify: async (result) => {
    console.log('Student profile updated successfully');
  }
});
