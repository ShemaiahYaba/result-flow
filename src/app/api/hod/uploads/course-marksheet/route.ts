import { NextRequest } from 'next/server';
import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * POST /api/hod/uploads/course-marksheet
 * Upload and process course marksheet file
 */
const CourseMarksheetUploadSchema = z.object({
  file: z.instanceof(File),
  course_id: z.string().uuid(),
  semester_id: z.string().uuid()
});

const CourseMarksheetResponseSchema = z.object({
  upload_id: z.string(),
  submission_id: z.string(),
  total_records: z.number(),
  processed_records: z.number(),
  failed_records: z.number(),
  status: z.string(),
  message: z.string()
});

export const POST = makeRoute({
  method: 'POST',
  output: CourseMarksheetResponseSchema,
  requiredRole: 'hod',
  handle: async ({ req, supabase, user }) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const course_id = formData.get('course_id') as string;
    const semester_id = formData.get('semester_id') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    if (!course_id || !semester_id) {
      throw new Error('Course ID and Semester ID are required');
    }

    // Verify HOD has access to this course
    const { data: courseData, error: courseError } = await supabase
      .from('hod_courses_dropdown')
      .select('*')
      .eq('hod_id', user.user_entity_id)
      .eq('course_id', course_id)
      .single();

    if (courseError || !courseData) {
      throw new Error('Course not found or access denied');
    }

    // Create file upload record
    const { data: fileUpload, error: uploadError } = await supabase
      .from('file_uploads')
      .insert({
        uploaded_by_hod: user.user_entity_id,
        file_type: 'course_marksheet',
        file_name: file.name,
        file_path: `/uploads/course-marksheet/${Date.now()}-${file.name}`,
        semester_id: semester_id,
        course_id: course_id,
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
    const requiredHeaders = ['matric_number', 'score', 'grade'];
    
    console.log('Course marksheet CSV headers found:', headers);
    console.log('Course marksheet required headers:', requiredHeaders);
    
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Missing required column: ${required}. Found headers: ${headers.join(', ')}`);
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

    // Process each result record
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const resultData: any = {};
        
        headers.forEach((header, index) => {
          resultData[header] = values[index] || null;
        });

        // Validate required fields
        if (!resultData.matric_number || !resultData.score || !resultData.grade) {
          throw new Error(`Row ${i + 1}: Missing required fields`);
        }

        // Validate score and grade
        const score = parseInt(resultData.score);
        if (isNaN(score) || score < 0 || score > 100) {
          throw new Error(`Row ${i + 1}: Invalid score (must be 0-100)`);
        }

        const validGrades = ['A', 'B', 'C', 'D', 'E', 'F'];
        if (!validGrades.includes(resultData.grade.toUpperCase())) {
          throw new Error(`Row ${i + 1}: Invalid grade (must be A, B, C, D, E, or F)`);
        }

        // Find student by matric number
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('matric_number', resultData.matric_number)
          .single();

        if (studentError || !student) {
          throw new Error(`Row ${i + 1}: Student ${resultData.matric_number} not found`);
        }

        // Find semester enrollment
        const { data: semesterEnrollment, error: semEnrollError } = await supabase
          .from('student_semester_enrollments')
          .select('id')
          .eq('student_id', student.id)
          .eq('semester_id', semester_id)
          .single();

        if (semEnrollError || !semesterEnrollment) {
          throw new Error(`Row ${i + 1}: Student ${resultData.matric_number} not enrolled in this semester`);
        }

        // Find course enrollment
        const { data: courseEnrollment, error: courseEnrollError } = await supabase
          .from('student_course_enrollments')
          .select('id')
          .eq('student_semester_enrollment_id', semesterEnrollment.id)
          .eq('course_id', course_id)
          .single();

        if (courseEnrollError || !courseEnrollment) {
          throw new Error(`Row ${i + 1}: Student ${resultData.matric_number} not enrolled in this course`);
        }

        // Insert or update result
        const { error: resultError } = await supabase
          .from('results_new')
          .upsert({
            student_course_enrollment_id: courseEnrollment.id,
            score: score,
            grade: resultData.grade.toUpperCase(),
            status: 'draft'
          });

        if (resultError) {
          throw new Error(`Failed to insert result: ${resultError.message}`);
        }

        processedCount++;
      } catch (error) {
        failedCount++;
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update file upload status
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

    // Create result submission for admin approval (only if processing was successful)
    let submissionId = '';
    if (finalStatus === 'completed' && processedCount > 0) {
      const { data: submission, error: submissionError } = await supabase
        .from('result_submissions')
        .insert({
          hod_id: user.user_entity_id,
          file_upload_id: fileUpload.id,
          course_id: course_id,
          semester_id: semester_id,
          total_results: processedCount,
          status: 'submitted',
          submission_notes: `Marksheet upload for ${courseData.course_code} - ${courseData.course_title}`
        })
        .select()
        .single();

      if (submissionError) {
        // Handle duplicate submission (one per course per semester)
        if (submissionError.code === '23505') {
          throw new Error('Results for this course and semester have already been submitted');
        }
        throw new Error(`Failed to create submission: ${submissionError.message}`);
      }

      submissionId = submission.id;

      // Get course enrollment IDs for this course and semester
      const { data: courseEnrollmentIds, error: enrollmentIdsError } = await supabase
        .from('student_course_enrollments')
        .select(`
          id,
          student_semester_enrollments!inner (
            semester_id
          )
        `)
        .eq('course_id', course_id)
        .eq('student_semester_enrollments.semester_id', semester_id);

      if (!enrollmentIdsError && courseEnrollmentIds) {
        const enrollmentIds = courseEnrollmentIds.map(e => e.id);
        
        // Update results to link to submission
        await supabase
          .from('results_new')
          .update({ 
            submission_id: submissionId,
            status: 'submitted'
          })
          .in('student_course_enrollment_id', enrollmentIds);
      }
    }

    return {
      upload_id: fileUpload.id,
      submission_id: submissionId,
      total_records: lines.length - 1,
      processed_records: processedCount,
      failed_records: failedCount,
      status: finalStatus,
      message: failedCount === 0 
        ? `Successfully processed ${processedCount} results and submitted for admin approval`
        : `Processed ${processedCount} records with ${failedCount} failures`
    };
  }
});
