import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * GET /api/user/university
 * Get university information for the authenticated user (works for all roles)
 */
const UniversityInfoResponseSchema = z.object({
  university_name: z.string(),
  university_code: z.string(),
  user_info: z.object({
    role: z.string(),
    name: z.string(),
    identifier: z.string() // matric_number for students, staff_id for staff
  })
});

export const GET = makeRoute({
  method: 'GET',
  output: UniversityInfoResponseSchema,
  handle: async ({ supabase, user }) => {
    const userEntityId = user.user_entity_id;
    
    console.log('University API - User role:', user.role, 'Entity ID:', userEntityId);
    
    if (!userEntityId) {
      throw new Error('User entity ID not found');
    }

    let universityData;
    let userInfo;

    if (user.role === 'student') {
      console.log('Processing student role');
      // Get student info with university
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          first_name,
          last_name,
          matric_number,
          departments!students_department_id_fkey (
            universities!departments_university_id_fkey (
              university_name,
              university_code
            )
          )
        `)
        .eq('id', userEntityId)
        .single();

      if (studentError || !studentData) {
        throw new Error('Student not found');
      }

      const department = (studentData as any).departments;
      const university = department?.universities;
      
      universityData = {
        university_name: university?.university_name,
        university_code: university?.university_code
      };
      userInfo = {
        role: 'student',
        name: `${studentData.first_name} ${studentData.last_name}`,
        identifier: studentData.matric_number
      };

    } else if (user.role === 'hod') {
      console.log('Processing hod role');
      // Get HOD info with university
      const { data: hodData, error: hodError } = await supabase
        .from('hods')
        .select(`
          first_name,
          last_name,
          staff_id,
          departments!hods_department_id_fkey (
            universities!departments_university_id_fkey (
              university_name,
              university_code
            )
          )
        `)
        .eq('id', userEntityId)
        .single();

      if (hodError || !hodData) {
        throw new Error('HOD not found');
      }

      const department = (hodData as any).departments;
      const university = department?.universities;
      
      universityData = {
        university_name: university?.university_name,
        university_code: university?.university_code
      };
      userInfo = {
        role: 'hod',
        name: `${hodData.first_name} ${hodData.last_name}`,
        identifier: hodData.staff_id
      };

    } else if (user.role === 'admin') {
      console.log('Processing admin role');
      // Get admin info with university
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select(`
          first_name,
          last_name,
          admin_id,
          universities!admins_university_id_fkey (
            university_name,
            university_code
          )
        `)
        .eq('id', userEntityId)
        .single();

      if (adminError) {
        console.error('Admin query error:', adminError);
        throw new Error(`Admin query failed: ${adminError.message}`);
      }
      
      if (!adminData) {
        console.error('Admin not found for userEntityId:', userEntityId);
        throw new Error('Admin not found');
      }

      const university = (adminData as any).universities;
      
      universityData = {
        university_name: university?.university_name,
        university_code: university?.university_code
      };
      userInfo = {
        role: 'admin',
        name: `${adminData.first_name} ${adminData.last_name}`,
        identifier: adminData.admin_id
      };
    } else {
      console.error('Invalid user role:', user.role);
      throw new Error(`Invalid user role: ${user.role}`);
    }

    if (!universityData || !userInfo) {
      throw new Error('University information not found');
    }

    return {
      university_name: universityData.university_name,
      university_code: universityData.university_code,
      user_info: userInfo
    };
  }
});
