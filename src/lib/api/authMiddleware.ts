import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ErrorHandler, ErrorType } from '@/utils/ErrorHandler';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email?: string;
    aud: string;
    exp?: number;
  };
  role: 'admin' | 'hod' | 'student';
}

export interface AuthMiddlewareOptions {
  requiredRole?: 'admin' | 'hod' | 'student';
  allowedRoles?: ('admin' | 'hod' | 'student')[];
}

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const UserProfileSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['admin', 'hod', 'student'])
});

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

export async function authMiddleware(
  req: NextRequest,
  options: AuthMiddlewareOptions = {},
  tokenFromContext?: string | null
): Promise<{ success: true; request: AuthenticatedRequest } | { success: false; error: any; status: number }> {
  const errorHandler = ErrorHandler.getInstance();
  
  try {
    let token: string;

    // Use token from context if provided, otherwise extract from header
    if (tokenFromContext) {
      token = tokenFromContext;
    } else {
      // Extract JWT from Authorization header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = errorHandler.createError(
          ErrorType.AUTH_INVALID_CREDENTIALS,
          'Missing or invalid Authorization header. Expected: Bearer <token>'
        );
        return { success: false, error, status: 401 };
      }

      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    if (!token) {
      const error = errorHandler.createError(
        ErrorType.AUTH_INVALID_CREDENTIALS,
        'JWT token is required'
      );
      return { success: false, error, status: 401 };
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      const error = errorHandler.createError(
        ErrorType.SYSTEM_CONFIGURATION_ERROR,
        'Supabase configuration missing'
      );
      return { success: false, error, status: 500 };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      const error = errorHandler.createError(
        ErrorType.AUTH_SESSION_EXPIRED,
        authError?.message || 'Invalid or expired JWT token'
      );
      return { success: false, error, status: 401 };
    }

    // Fetch user role from users table with role join
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select(`
        user_entity_id,
        roles!inner(role_name)
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !userData) {
      const error = errorHandler.createError(
        ErrorType.DB_NOT_FOUND,
        'User not found in system'
      );
      return { success: false, error, status: 403 };
    }

    const profile = {
      id: user.id,
      role: (userData.roles as any)?.role_name,
      user_entity_id: userData.user_entity_id
    };


    // Validate profile data
    let validatedProfile;
    try {
      validatedProfile = UserProfileSchema.parse(profile);
    } catch (validationError) {
      const error = errorHandler.createError(
        ErrorType.VALIDATION_INVALID_FORMAT,
        'Invalid user profile data'
      );
      return { success: false, error, status: 403 };
    }

    // Check role-based authorization
    if (options.requiredRole && validatedProfile.role !== options.requiredRole) {
      // Admin has access to everything (following your existing pattern)
      if (validatedProfile.role !== 'admin') {
        const error = errorHandler.createError(
          ErrorType.AUTH_INSUFFICIENT_PERMISSIONS,
          `Access denied. Required role: ${options.requiredRole}, user role: ${validatedProfile.role}`
        );
        return { success: false, error, status: 403 };
      }
    }

    if (options.allowedRoles && !options.allowedRoles.includes(validatedProfile.role)) {
      // Admin has access to everything
      if (validatedProfile.role !== 'admin') {
        const error = errorHandler.createError(
          ErrorType.AUTH_INSUFFICIENT_PERMISSIONS,
          `Access denied. Allowed roles: ${options.allowedRoles.join(', ')}, user role: ${validatedProfile.role}`
        );
        return { success: false, error, status: 403 };
      }
    }

    // Attach user and role to request
    const authenticatedRequest = req as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: user.id,
      email: user.email,
      aud: user.aud,
      exp: user.user_metadata?.exp
    };
    authenticatedRequest.role = validatedProfile.role;

    return { success: true, request: authenticatedRequest };

  } catch (error: any) {
    const appError = errorHandler.handleError(error, {
      context: 'authMiddleware',
      url: req.url,
      method: req.method
    });
    
    const status = appError.type === ErrorType.AUTH_INVALID_CREDENTIALS ? 401 :
                  appError.type === ErrorType.AUTH_INSUFFICIENT_PERMISSIONS ? 403 : 500;
    
    return { success: false, error: appError, status };
  }
}

// ============================================================
// MIDDLEWARE WRAPPER FOR ROUTE HANDLERS
// ============================================================

export function withAuth<T = any>(
  handler: (req: AuthenticatedRequest) => Promise<Response>,
  options: AuthMiddlewareOptions = {}
) {
  return async (req: NextRequest): Promise<Response> => {
    const authResult = await authMiddleware(req, options);
    
    if (!authResult.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: authResult.error.type,
            message: authResult.error.message,
            details: authResult.error.details
          }
        }),
        {
          status: authResult.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(authResult.request);
  };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function extractTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function createAuthResponse(error: any, status: number = 401): Response {
  const errorHandler = ErrorHandler.getInstance();
  const appError = errorHandler.handleError(error);
  
  return new Response(
    JSON.stringify({
      ok: false,
      error: {
        code: appError.type,
        message: appError.message,
        details: appError.details
      }
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
