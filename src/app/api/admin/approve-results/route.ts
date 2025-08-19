import { NextRequest } from 'next/server';
import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * GET /api/admin/approve-results
 * Fetch pending result submissions for admin approval
 */
const ApproveResultsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10')
});

const ResultSubmissionSchema = z.object({
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
  file_upload: z.object({
    id: z.string(),
    file_name: z.string(),
    total_records: z.number(),
    processed_records: z.number(),
    failed_records: z.number(),
    status: z.string()
  })
});

const ApproveResultsResponseSchema = z.object({
  submissions: z.array(ResultSubmissionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number()
});

export const GET = makeRoute({
  method: 'GET',
  input: ApproveResultsQuerySchema,
  output: ApproveResultsResponseSchema,
  requiredRole: 'admin',
  handle: async ({ input, supabase }) => {
    const page = parseInt(input.page || '1');
    const limit = parseInt(input.limit || '10');
    const offset = (page - 1) * limit;

    // Get pending submissions with related data
    const { data: submissions, error: submissionsError } = await supabase
      .from('result_submissions')
      .select(`
        id,
        hod_id,
        course_id,
        semester_id,
        total_results,
        status,
        submission_notes,
        submitted_at,
        file_uploads!inner (
          id,
          file_name,
          total_records,
          processed_records,
          failed_records,
          status
        ),
        entities!result_submissions_hod_id_fkey (
          full_name
        ),
        courses (
          course_code,
          course_title
        ),
        semesters (
          semester_name
        )
      `)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (submissionsError) {
      throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('result_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    if (countError) {
      throw new Error(`Failed to get submissions count: ${countError.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const formattedSubmissions = submissions?.map(submission => ({
      id: submission.id,
      hod_id: submission.hod_id,
      hod_name: (submission.entities as any)?.full_name || 'Unknown HOD',
      course_id: submission.course_id,
      course_code: (submission.courses as any)?.course_code || 'Unknown',
      course_title: (submission.courses as any)?.course_title || 'Unknown Course',
      semester_id: submission.semester_id,
      semester_name: (submission.semesters as any)?.semester_name || 'Unknown Semester',
      total_results: submission.total_results,
      status: submission.status,
      submission_notes: submission.submission_notes,
      submitted_at: submission.submitted_at,
      file_upload: {
        id: (submission.file_uploads as any).id,
        file_name: (submission.file_uploads as any).file_name,
        total_records: (submission.file_uploads as any).total_records,
        processed_records: (submission.file_uploads as any).processed_records,
        failed_records: (submission.file_uploads as any).failed_records,
        status: (submission.file_uploads as any).status
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

/**
 * POST /api/admin/approve-results
 * Approve or reject result submissions
 */
const ApproveResultsBodySchema = z.object({
  submission_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  admin_notes: z.string().optional()
});

const ApproveResultsPostResponseSchema = z.object({
  submission_id: z.string(),
  status: z.string(),
  message: z.string()
});

export const POST = makeRoute({
  method: 'POST',
  input: ApproveResultsBodySchema,
  output: ApproveResultsPostResponseSchema,
  requiredRole: 'admin',
  handle: async ({ input, supabase, user }) => {
    const { submission_id, action, admin_notes } = input;

    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('result_submissions')
      .select(`
        id,
        hod_id,
        course_id,
        semester_id,
        status,
        courses (course_code, course_title)
      `)
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      throw new Error('Submission not found');
    }

    if (submission.status !== 'submitted') {
      throw new Error('Submission is not in submitted status');
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const resultStatus = action === 'approve' ? 'approved' : 'draft';

    // Update submission status
    const { error: updateError } = await supabase
      .from('result_submissions')
      .update({
        status: newStatus,
        admin_id: user.user_entity_id,
        admin_notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submission_id);

    if (updateError) {
      throw new Error(`Failed to update submission: ${updateError.message}`);
    }

    // Update related results status
    const { error: resultsUpdateError } = await supabase
      .from('results_new')
      .update({ status: resultStatus })
      .eq('submission_id', submission_id);

    if (resultsUpdateError) {
      throw new Error(`Failed to update results: ${resultsUpdateError.message}`);
    }

    const actionText = action === 'approve' ? 'approved' : 'rejected';
    const courseInfo = submission.courses ? 
      `${(submission.courses as any).course_code} - ${(submission.courses as any).course_title}` : 
      'Unknown Course';

    return {
      submission_id,
      status: newStatus,
      message: `Successfully ${actionText} results for ${courseInfo}`
    };
  }
});
