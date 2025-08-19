import { NextRequest } from 'next/server';
import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * GET /api/hod/upload-details
 * Fetch file upload details and error information for HOD
 */
const UploadDetailsQuerySchema = z.object({
  upload_id: z.string().uuid().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10)
});

const FileUploadSchema = z.object({
  id: z.string(),
  file_name: z.string(),
  file_type: z.string(),
  total_records: z.number(),
  processed_records: z.number(),
  failed_records: z.number(),
  status: z.string(),
  error_details: z.any().nullable(),
  uploaded_at: z.string(),
  processed_at: z.string().nullable(),
  course: z.object({
    course_code: z.string(),
    course_title: z.string()
  }).nullable(),
  semester: z.object({
    semester_name: z.string()
  }).nullable()
});

const UploadDetailsResponseSchema = z.object({
  uploads: z.array(FileUploadSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
});

export const GET = makeRoute({
  method: 'GET',
  input: UploadDetailsQuerySchema,
  output: UploadDetailsResponseSchema,
  requiredRole: 'hod',
  handle: async ({ input, supabase, user }) => {
    const page = typeof input.page === 'number' ? input.page : parseInt(String(input.page || 1));
    const limit = typeof input.limit === 'number' ? input.limit : parseInt(String(input.limit || 10));
    const offset = (page - 1) * limit;

    let queryBuilder = supabase
      .from('file_uploads')
      .select(`
        id,
        file_name,
        file_type,
        total_records,
        processed_records,
        failed_records,
        status,
        error_details,
        uploaded_at,
        processed_at,
        courses (
          course_code,
          course_title
        )
      `)
      .eq('uploaded_by_hod', user.user_entity_id)
      .order('uploaded_at', { ascending: false });

    // If specific upload_id is requested, filter by it
    if (input.upload_id) {
      queryBuilder = queryBuilder.eq('id', input.upload_id);
    }

    const { data: uploads, error: uploadsError } = await queryBuilder
      .range(offset, offset + limit - 1);

    if (uploadsError) {
      throw new Error(`Failed to fetch uploads: ${uploadsError.message}`);
    }

    // Get total count
    let countQuery = supabase
      .from('file_uploads')
      .select('*', { count: 'exact', head: true })
      .eq('uploaded_by_hod', user.user_entity_id);

    if (input.upload_id) {
      countQuery = countQuery.eq('id', input.upload_id);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to get uploads count: ${countError.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const formattedUploads = uploads?.map(upload => ({
      id: upload.id,
      file_name: upload.file_name,
      file_type: upload.file_type,
      total_records: upload.total_records || 0,
      processed_records: upload.processed_records || 0,
      failed_records: upload.failed_records || 0,
      status: upload.status,
      error_details: upload.error_details,
      uploaded_at: upload.uploaded_at,
      processed_at: upload.processed_at,
      course: upload.courses ? {
        course_code: (upload.courses as any).course_code,
        course_title: (upload.courses as any).course_title
      } : null,
      semester: null
    })) || [];

    return {
      uploads: formattedUploads,
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }
});
