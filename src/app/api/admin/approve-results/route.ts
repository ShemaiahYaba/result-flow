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
  handle: async ({ input, supabase, user }) => {
    const page = parseInt(input.page || '1');
    const limit = parseInt(input.limit || '10');
    const offset = (page - 1) * limit;

    // Get pending submissions using the admin_pending_approvals view
    const { data: submissions, error: submissionsError } = await supabase
      .from('admin_pending_approvals')
      .select('*')
      .eq('status', 'submitted')
      .eq('admin_id', user.user_entity_id)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (submissionsError) {
      throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('admin_pending_approvals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted')
      .eq('admin_id', user.user_entity_id);

    if (countError) {
      throw new Error(`Failed to get submissions count: ${countError.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const formattedSubmissions = submissions?.map(submission => ({
      id: submission.submission_id,
      hod_id: submission.hod_staff_id,
      hod_name: submission.submitted_by_hod || 'Unknown HOD',
      course_id: submission.course_id || '',
      course_code: submission.course_code || 'Unknown',
      course_title: submission.course_title || 'Unknown Course',
      semester_id: submission.semester_id || '',
      semester_name: 'Current Semester', // View doesn't include semester name
      total_results: submission.total_results,
      status: submission.status,
      submission_notes: submission.submission_notes,
      submitted_at: submission.submitted_at,
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
