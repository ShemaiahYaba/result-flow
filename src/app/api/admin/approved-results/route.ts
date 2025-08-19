import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Schema for approved results query
const ApprovedResultsQuerySchema = z.object({
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional()
});

// Schema for approved results response
const ApprovedResultsResponseSchema = z.object({
  submissions: z.array(z.object({
    id: z.string(),
    hod_id: z.string(),
    hod_name: z.string(),
    course_id: z.string(),
    course_code: z.string(),
    course_title: z.string(),
    semester_id: z.string(),
    semester_name: z.string(),
    total_results: z.number(),
    status: z.string(),
    submission_notes: z.string().nullable(),
    submitted_at: z.string(),
    reviewed_at: z.string().nullable(),
    file_upload: z.object({
      id: z.string(),
      file_name: z.string(),
      total_records: z.number(),
      processed_records: z.number(),
      failed_records: z.number(),
      status: z.string()
    })
  })),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
});

export const GET = makeRoute({
  method: 'GET',
  input: ApprovedResultsQuerySchema,
  output: ApprovedResultsResponseSchema,
  requiredRole: 'admin',
  handle: async ({ input, supabase, user }) => {
    const page = parseInt(String(input.page || '1'));
    const limit = parseInt(String(input.limit || '10'));
    const offset = (page - 1) * limit;

    // Get approved submissions using the admin_approved_results view
    const { data: submissions, error: submissionsError } = await supabase
      .from('admin_approved_results')
      .select('*')
      .eq('admin_id', user.user_entity_id)
      .order('reviewed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (submissionsError) {
      throw new Error(`Failed to fetch approved submissions: ${submissionsError.message}`);
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('admin_approved_results')
      .select('*', { count: 'exact', head: true })
      .eq('admin_id', user.user_entity_id);

    if (countError) {
      throw new Error(`Failed to get approved submissions count: ${countError.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const formattedSubmissions = submissions?.map(submission => ({
      id: submission.submission_id,
      hod_id: submission.hod_id,
      hod_name: submission.submitted_by_hod || 'Unknown HOD',
      course_id: submission.course_id || '',
      course_code: submission.course_code || 'Unknown',
      course_title: submission.course_title || 'Unknown Course',
      semester_id: submission.semester_id || '',
      semester_name: 'Current Semester',
      total_results: submission.total_results,
      status: submission.status,
      submission_notes: submission.submission_notes,
      submitted_at: submission.submitted_at,
      reviewed_at: submission.reviewed_at,
      file_upload: {
        id: '',
        file_name: 'N/A',
        total_records: submission.total_results,
        processed_records: submission.total_results,
        failed_records: 0,
        status: 'completed'
      }
    })) || [];

    return {
      submissions: formattedSubmissions,
      total: count || 0,
      page,
      limit,
      totalPages
    };
  }
});
