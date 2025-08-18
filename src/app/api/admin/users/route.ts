import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/authMiddleware';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ErrorHandler, ErrorType } from '@/utils/ErrorHandler';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const UsersResponseSchema = z.object({
  users: z.array(z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['admin', 'hod', 'student']),
    created_at: z.string(),
    last_sign_in_at: z.string().nullable()
  })),
  total: z.number().int().min(0)
});

// ============================================================
// GET /api/admin/users
// Fetch all users (admin only)
// ============================================================

export const GET = withAuth(
  async (req) => {
    const errorHandler = ErrorHandler.getInstance();
    
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        const error = errorHandler.createError(
          ErrorType.SYSTEM_CONFIGURATION_ERROR,
          'Supabase configuration missing'
        );
        return NextResponse.json(
          { ok: false, error },
          { status: 500 }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Fetch users with their profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          role,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        const error = errorHandler.parseSupabaseError(profilesError);
        return NextResponse.json(
          { ok: false, error },
          { status: 500 }
        );
      }

      const users = (profiles || []).map(profile => ({
        id: profile.id,
        email: '', // Email will be fetched separately if needed
        role: profile.role,
        created_at: profile.created_at,
        last_sign_in_at: null
      }));

      const response = {
        users,
        total: users.length
      };

      // Validate response
      const validatedResponse = UsersResponseSchema.parse(response);

      return NextResponse.json({
        ok: true,
        data: validatedResponse
      });

    } catch (error: any) {
      const appError = errorHandler.handleError(error, {
        context: 'GET /api/admin/users',
        userId: req.user.id
      });

      const status = appError.type === ErrorType.VALIDATION_INVALID_FORMAT ? 400 : 500;

      return NextResponse.json(
        { ok: false, error: appError },
        { status }
      );
    }
  },
  { requiredRole: 'admin' } // Only admins can access this endpoint
);
