import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';
import { NextRequest } from 'next/server';

// Response schema
const CourseRegistryUploadResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  upload_id: z.string(),
  total_records: z.number(),
  processed_records: z.number(),
  failed_records: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    error: z.string(),
    data: z.record(z.any()).optional()
  })).optional()
});

/**
 * POST /api/hod/uploads/course-registry
 * Upload course registry CSV file
 */
export const POST = makeRoute({
  method: 'POST',
  output: CourseRegistryUploadResponseSchema,
  requiredRole: 'hod',
  handle: async ({ supabase, user, req }) => {
    const hodId = user.user_entity_id;

    // Get HOD info with department
    const { data: hodData, error: hodError } = await supabase
      .from('hods')
      .select(`
        id,
        department_id,
        departments!hods_department_id_fkey (
          id,
          department_name,
          university_id
        )
      `)
      .eq('id', hodId)
      .single();

    if (hodError || !hodData) {
      throw new Error('HOD not found');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const semesterId = formData.get('semester_id') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    if (!semesterId) {
      throw new Error('Semester ID is required');
    }

    // Validate semester exists
    const { data: semesterData, error: semesterError } = await supabase
      .from('academic_semesters')
      .select('id')
      .eq('id', semesterId)
      .single();

    if (semesterError || !semesterData) {
      throw new Error('Invalid semester');
    }

    // Read and parse CSV file
    const fileContent = await file.text();
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Expected headers: course_code, course_title, course_unit, level, semester
    const requiredHeaders = ['course_code', 'course_title', 'course_unit', 'level', 'semester'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    // Create file upload record
    const { data: uploadRecord, error: uploadError } = await supabase
      .from('file_uploads')
      .insert({
        uploaded_by_hod: hodId,
        file_type: 'course_registry',
        file_name: file.name,
        file_path: `/uploads/course-registry/${Date.now()}-${file.name}`,
        semester_id: semesterId,
        total_records: lines.length - 1,
        status: 'processing'
      })
      .select()
      .single();

    if (uploadError || !uploadRecord) {
      throw new Error('Failed to create upload record');
    }

    let processedRecords = 0;
    let failedRecords = 0;
    const errors: any[] = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim());
      
      if (row.length !== headers.length) {
        failedRecords++;
        errors.push({
          row: i + 1,
          error: `Invalid number of columns. Expected ${headers.length}, got ${row.length}`,
          data: {}
        });
        continue;
      }

      // Create row object
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });

      try {
        // Validate required fields
        if (!rowData.course_code || !rowData.course_title) {
          throw new Error('Course code and title are required');
        }

        const courseUnit = parseInt(rowData.course_unit);
        const level = parseInt(rowData.level);

        if (isNaN(courseUnit) || courseUnit <= 0) {
          throw new Error('Course unit must be a positive number');
        }

        if (isNaN(level) || ![100, 200, 300, 400, 500].includes(level)) {
          throw new Error('Level must be 100, 200, 300, 400, or 500');
        }

        if (!['first', 'second'].includes(rowData.semester.toLowerCase())) {
          throw new Error('Semester must be "first" or "second"');
        }

        // Check if course already exists
        const { data: existingCourse } = await supabase
          .from('courses')
          .select('id')
          .eq('course_code', rowData.course_code)
          .eq('department_id', (hodData as any).department_id)
          .single();

        if (existingCourse) {
          // Update existing course
          const { error: updateError } = await supabase
            .from('courses')
            .update({
              course_title: rowData.course_title,
              course_unit: courseUnit,
              level: level,
              semester: rowData.semester.toLowerCase(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCourse.id);

          if (updateError) {
            throw new Error(`Failed to update course: ${updateError.message}`);
          }
        } else {
          // Create new course
          const { error: insertError } = await supabase
            .from('courses')
            .insert({
              course_code: rowData.course_code,
              course_title: rowData.course_title,
              course_unit: courseUnit,
              level: level,
              semester: rowData.semester.toLowerCase(),
              department_id: (hodData as any).department_id,
              is_active: true
            });

          if (insertError) {
            throw new Error(`Failed to create course: ${insertError.message}`);
          }
        }

        processedRecords++;
      } catch (error) {
        failedRecords++;
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: rowData
        });
      }
    }

    // Create course registry upload tracking record
    await supabase
      .from('course_registry_uploads')
      .insert({
        hod_id: hodId,
        semester_id: semesterId,
        file_upload_id: uploadRecord.id,
        courses_added: processedRecords - (lines.length - 1 - processedRecords), // New courses
        courses_updated: (lines.length - 1 - processedRecords), // Updated courses  
        status: failedRecords === 0 ? 'completed' : 'completed',
        upload_summary: {
          total_processed: processedRecords,
          total_failed: failedRecords,
          errors: errors.slice(0, 10)
        },
        completed_at: new Date().toISOString()
      });

    // Update upload record with results
    const status = failedRecords === 0 ? 'completed' : 'completed_with_errors';
    await supabase
      .from('file_uploads')
      .update({
        processed_records: processedRecords,
        failed_records: failedRecords,
        status: status,
        error_details: errors.length > 0 ? { errors } : null,
        processed_at: new Date().toISOString()
      })
      .eq('id', uploadRecord.id);

    return {
      status: status,
      message: failedRecords === 0 
        ? 'Course registry uploaded successfully'
        : `Course registry uploaded with ${failedRecords} errors`,
      upload_id: uploadRecord.id,
      total_records: lines.length - 1,
      processed_records: processedRecords,
      failed_records: failedRecords,
      errors: errors.slice(0, 10) // Return first 10 errors only
    };
  }
});
