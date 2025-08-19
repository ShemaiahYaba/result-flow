import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'hod', 'student']),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  created_at: z.string(),
  last_sign_in_at: z.string().nullable()
});

const UsersResponseSchema = z.array(UserSchema);

// ============================================================
// GET /api/admin/users
// Fetch all users from admin's university
// ============================================================

export const GET = makeRoute({
  method: 'GET',
  requiredRole: 'admin',
  output: UsersResponseSchema,
  handle: async ({ supabase, user }) => {
    // Get admin's university through user lookup
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (adminError || !adminData) {
      throw new Error('Admin not found');
    }

    // Fetch users from the same university
    // Get all admins, hods, and students from this university
    const { data: universityAdmins, error: adminsError } = await supabase
      .from('admins')
      .select(`
        id,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          created_at,
          roles!inner(role_name)
        )
      `)
      .eq('university_id', adminData.university_id);

    const { data: universityHods, error: hodsError } = await supabase
      .from('hods')
      .select(`
        id,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          created_at,
          roles!inner(role_name)
        ),
        departments!inner(university_id)
      `)
      .eq('departments.university_id', adminData.university_id);

    const { data: universityStudents, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          created_at,
          roles!inner(role_name)
        ),
        departments!inner(university_id)
      `)
      .eq('departments.university_id', adminData.university_id);

    if (adminsError || hodsError || studentsError) {
      throw new Error('Failed to fetch university users');
    }

    // Combine all users from the university
    const allUsers: any[] = [];
    
    // Add admins
    (universityAdmins || []).forEach((admin: any) => {
      if (admin.users) {
        allUsers.push({
          id: admin.users.id,
          email: admin.users.email,
          role: admin.users.roles?.role_name || 'admin',
          first_name: admin.users.first_name,
          last_name: admin.users.last_name,
          created_at: admin.users.created_at,
          last_sign_in_at: null
        });
      }
    });

    // Add HODs
    (universityHods || []).forEach((hod: any) => {
      if (hod.users) {
        allUsers.push({
          id: hod.users.id,
          email: hod.users.email,
          role: hod.users.roles?.role_name || 'hod',
          first_name: hod.users.first_name,
          last_name: hod.users.last_name,
          created_at: hod.users.created_at,
          last_sign_in_at: null
        });
      }
    });

    // Add students
    (universityStudents || []).forEach((student: any) => {
      if (student.users) {
        allUsers.push({
          id: student.users.id,
          email: student.users.email,
          role: student.users.roles?.role_name || 'student',
          first_name: student.users.first_name,
          last_name: student.users.last_name,
          created_at: student.users.created_at,
          last_sign_in_at: null
        });
      }
    });

    // Sort by creation date (newest first)
    allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allUsers;
  }
});
