import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

/**
 * GET /api/hod/semesters
 * Get semesters dropdown list for HOD
 */
const SemesterSchema = z.object({
  semester_id: z.string(),
  session_name: z.string(),
  semester_name: z.string(),
  display_name: z.string(),
  hod_id: z.string()
});

const HodSemestersResponseSchema = z.array(SemesterSchema);

export const GET = makeRoute({
  method: 'GET',
  output: HodSemestersResponseSchema,
  requiredRole: 'hod',
  handle: async ({ supabase, user }) => {
    // Get semesters for HOD's department using the database view
    const { data: semesters, error: semestersError } = await supabase
      .from('hod_available_semesters')
      .select('*')
      .eq('hod_id', user.user_entity_id);

    if (semestersError) {
      throw new Error(`Failed to fetch semesters: ${semestersError.message}`);
    }

    return semesters || [];
  }
});
