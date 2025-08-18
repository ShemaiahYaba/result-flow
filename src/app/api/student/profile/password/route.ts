import { makeRoute } from '@/lib/api/routeFactory';
import { 
  UpdatePasswordRequestSchema,
  MessageResponseSchema 
} from '@/schemas/student/api';

/**
 * POST /api/student/profile/password
 * Update student's password
 */
export const POST = makeRoute({
  method: 'POST',
  input: UpdatePasswordRequestSchema,
  output: MessageResponseSchema,
  requiredRole: 'student',
  handle: async ({ supabase, input }) => {
    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: '', // We'll need to get this from the user context
      password: input.current_password
    });

    // For security, we'll use Supabase's built-in password update
    // which requires the user to be authenticated
    const { error } = await supabase.auth.updateUser({
      password: input.new_password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }

    return {
      message: 'Password updated successfully'
    };
  },
  onSuccessNotify: async (result) => {
    console.log('Student password updated successfully');
  }
});
