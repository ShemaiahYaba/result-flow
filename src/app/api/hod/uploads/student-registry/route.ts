import { NextRequest } from 'next/server';
import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * POST /api/hod/uploads/student-registry
 * Upload and process student registry file
 */
const StudentRegistryUploadSchema = z.object({
  file: z.instanceof(File),
  semester_id: z.string().uuid()
});

const StudentRegistryResponseSchema = z.object({
  upload_id: z.string(),
  total_records: z.number(),
  processed_records: z.number(),
  failed_records: z.number(),
  status: z.string(),
  message: z.string()
});

export const POST = makeRoute({
  method: 'POST',
  output: StudentRegistryResponseSchema,
  requiredRole: 'hod',
  handle: async ({ req, supabase, user }) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const semester_id = formData.get('semester_id') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    if (!semester_id) {
      throw new Error('Semester ID is required');
    }

    // Get HOD details for department context
    const { data: hodData, error: hodError } = await supabase
      .from('hods')
      .select('department_id')
      .eq('id', user.user_entity_id)
      .single();

    if (hodError || !hodData) {
      throw new Error('HOD not found');
    }

    // Create file upload record
    const { data: fileUpload, error: uploadError } = await supabase
      .from('file_uploads')
      .insert({
        uploaded_by_hod: user.user_entity_id,
        file_type: 'student_registry',
        file_name: file.name,
        file_path: `/uploads/student-registry/${Date.now()}-${file.name}`,
        semester_id: semester_id,
        total_records: 0,
        status: 'uploaded'
      })
      .select()
      .single();

    if (uploadError) {
      throw new Error(`Failed to create upload record: ${uploadError.message}`);
    }

    // Parse CSV/Excel file
    const fileContent = await file.text();
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('File must contain header and at least one data row');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['matric_number', 'first_name', 'last_name', 'email', 'level'];
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Missing required column: ${required}`);
      }
    }

    // Update status to processing
    await supabase
      .from('file_uploads')
      .update({ 
        status: 'processing',
        total_records: lines.length - 1
      })
      .eq('id', fileUpload.id);

    let processedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Process each student record
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const studentData: any = {};
        
        headers.forEach((header, index) => {
          studentData[header] = values[index] || null;
        });

        // Validate required fields
        if (!studentData.matric_number || !studentData.first_name || !studentData.last_name || !studentData.email) {
          throw new Error(`Row ${i + 1}: Missing required fields`);
        }

        // Check if student already exists
        const { data: existingStudent, error: checkError } = await supabase
          .from('students')
          .select('id')
          .eq('matric_number', studentData.matric_number)
          .single();

        let studentId: string;

        if (existingStudent) {
          // Student exists, use existing ID
          studentId = existingStudent.id;
        } else {
          // Insert new student record
          const { data: student, error: studentError } = await supabase
            .from('students')
            .insert({
              first_name: studentData.first_name,
              middle_name: studentData.middle_name || null,
              last_name: studentData.last_name,
              matric_number: studentData.matric_number,
              email: studentData.email,
              phone_number: studentData.phone_number || null,
              department_id: hodData.department_id
            })
            .select()
            .single();

          if (studentError) {
            throw new Error(`Failed to insert student: ${studentError.message}`);
          }
          studentId = student.id;
        }

        // Create semester enrollment
        const { error: enrollmentError } = await supabase
          .from('student_semester_enrollments')
          .insert({
            student_id: studentId,
            semester_id: semester_id,
            level: parseInt(studentData.level) || 100,
            enrollment_status: 'registered'
          });

        if (enrollmentError && enrollmentError.code !== '23505') {
          throw new Error(`Failed to create enrollment: ${enrollmentError.message}`);
        }

        // Get semester enrollment ID for course enrollments
        const { data: semesterEnrollment, error: semEnrollError } = await supabase
          .from('student_semester_enrollments')
          .select('id')
          .eq('student_id', studentId)
          .eq('semester_id', semester_id)
          .single();

        if (semesterEnrollment) {
          // Get department courses for this level
          const { data: levelCourses, error: coursesError } = await supabase
            .from('courses')
            .select('id, level')
            .eq('department_id', hodData.department_id)
            .eq('level', parseInt(studentData.level));

          if (!coursesError && levelCourses) {
            // Create course enrollments
            for (const course of levelCourses) {
              await supabase
                .from('student_course_enrollments')
                .insert({
                  student_semester_enrollment_id: semesterEnrollment.id,
                  course_id: course.id,
                  status: 'enrolled'
                });
            }
          }
        }

        processedCount++;
      } catch (error) {
        failedCount++;
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update final status
    const finalStatus = failedCount === 0 ? 'completed' : 'failed';
    await supabase
      .from('file_uploads')
      .update({
        processed_records: processedCount,
        failed_records: failedCount,
        status: finalStatus,
        error_details: errors.length > 0 ? { errors } : null,
        processed_at: new Date().toISOString()
      })
      .eq('id', fileUpload.id);

    return {
      upload_id: fileUpload.id,
      total_records: lines.length - 1,
      processed_records: processedCount,
      failed_records: failedCount,
      status: finalStatus,
      message: failedCount === 0 
        ? `Successfully processed ${processedCount} student records`
        : `Processed ${processedCount} records with ${failedCount} failures`
    };
  }
});
