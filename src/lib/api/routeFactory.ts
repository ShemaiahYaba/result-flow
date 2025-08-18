import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// ============================================================
// TYPES
// ============================================================

export type ApiSuccess<T> = { 
  ok: true; 
  data: T; 
  meta?: any 
};

export type ApiError = { 
  ok: false; 
  error: { 
    code: string; 
    message: string; 
    details?: any 
  } 
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  user_entity_id?: string;
  aud: string;
  exp?: number;
}

export interface RouteContext<I = unknown> {
  req: NextRequest;
  input: I;
  supabase: ReturnType<typeof createClient>;
  user: AuthenticatedUser;
}

export interface HandlerConfig<I, O> {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  input?: z.ZodType<I>;
  output?: z.ZodType<O>;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'hod' | 'student';
  handle: (ctx: RouteContext<I>) => Promise<O>;
  onSuccessNotify?: (payload: O) => Promise<void> | void;
  onErrorNotify?: (err: any) => Promise<void> | void;
}

// ============================================================
// ERROR MAPPING
// ============================================================

export function errorToApiError(error: any): ApiError['error'] {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: error.errors
    };
  }

  // Supabase errors
  if (error?.code) {
    return {
      code: error.code,
      message: error.message || 'Database error occurred',
      details: error.details
    };
  }

  // Authentication errors
  if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
    return {
      code: 'AUTHENTICATION_ERROR',
      message: 'Authentication required or invalid',
      details: error.message
    };
  }

  // Authorization errors
  if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
    return {
      code: 'AUTHORIZATION_ERROR',
      message: 'Insufficient permissions',
      details: error.message
    };
  }

  // Generic errors
  return {
    code: 'INTERNAL_ERROR',
    message: error?.message || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error : undefined
  };
}

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser> {
  // First, try to get Bearer token from Authorization header
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  let supabase;
  let user;
  
  if (bearerToken) {
    // Use Bearer token authentication
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Verify the JWT token
    const { data: { user: tokenUser }, error } = await supabase.auth.getUser(bearerToken);
    
    if (error || !tokenUser) {
      console.error('Bearer token validation failed:', error?.message);
      if (error?.message?.includes('refresh_token_not_found') || error?.message?.includes('Invalid Refresh Token')) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error('Authentication required');
    }
    
    user = tokenUser;
  } else {
    // Fall back to cookie-based authentication
    const cookieStore = cookies();
    supabase = createClient(cookieStore);
    
    const { data: { user: cookieUser }, error } = await supabase.auth.getUser();
    
    if (error) {
      if (error.message?.includes('refresh_token_not_found') || error.message?.includes('Invalid Refresh Token')) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error('Authentication required');
    }
    
    if (!cookieUser) {
      throw new Error('Authentication required');
    }
    
    user = cookieUser;
  }

  // Get user data from users table using service client for auth queries
  const serviceSupabase = createServiceClient();
  
  // Use maybeSingle() to handle potential duplicates gracefully
  const { data: userData, error: userError } = await serviceSupabase
    .from('users')
    .select(`
      role_id,
      user_entity_id
    `)
    .eq('id', user.id)
    .maybeSingle();

  if (userError) {
    console.error('User lookup error:', userError);
    throw new Error(`User lookup failed: ${userError.message}`);
  }

  if (!userData) {
    throw new Error('User not found in system');
  }

  // Fetch role separately to avoid join issues
  const { data: roleData, error: roleError } = await serviceSupabase
    .from('roles')
    .select('role_name')
    .eq('id', userData.role_id)
    .maybeSingle();

  if (roleError) {
    console.error('Role lookup error:', roleError);
    throw new Error(`Role lookup failed: ${roleError.message}`);
  }

  if (!roleData) {
    throw new Error('User role not found');
  }

  return {
    id: user.id,
    email: user.email,
    role: roleData.role_name,
    user_entity_id: userData.user_entity_id,
    aud: user.aud,
    exp: (user as any).exp || 0
  };
}

function checkRolePermission(userRole: string | undefined, requiredRole: string): boolean {
  if (!userRole) return false;
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  // Exact role match
  if (userRole === requiredRole) return true;
  
  return false;
}

// ============================================================
// ROUTE FACTORY
// ============================================================

export function makeRoute<I = unknown, O = unknown>(config: HandlerConfig<I, O>) {
  return async (req: NextRequest) => {
    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);
      
      // Authentication check
      let user: AuthenticatedUser | null = null;
      if (config.requireAuth !== false) {
        try {
          console.log('Route factory - attempting authentication for:', req.url);
          user = await getAuthenticatedUser(req);
          console.log('Route factory - authenticated user:', { id: user.id, role: user.role, email: user.email });
        } catch (authError: any) {
          console.log('Route factory - authentication error:', authError.message);
          // Handle authentication errors specifically
          if (authError.message?.includes('Session expired')) {
            return NextResponse.json(
              { ok: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired. Please log in again.' } },
              { status: 401 }
            );
          }
          return NextResponse.json(
            { ok: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Authentication required' } },
            { status: 401 }
          );
        }
        
        const supabase = createClient(cookies());
        
        // Check role permissions if required
        if (config.requiredRole && !checkRolePermission(user.role, config.requiredRole)) {
          return NextResponse.json(
            { ok: false, error: { code: 'AUTHORIZATION_ERROR', message: 'Insufficient permissions' } },
            { status: 403 }
          );
        }
      }

      // Parse input based on method
      let inputRaw: any = {};
      if (config.method === 'GET') {
        const url = new URL(req.url);
        inputRaw = Object.fromEntries(url.searchParams);
        
        // Convert string values to appropriate types for GET params
        Object.keys(inputRaw).forEach(key => {
          const value = inputRaw[key];
          // Try to parse numbers
          if (/^\d+$/.test(value)) {
            inputRaw[key] = parseInt(value, 10);
          }
          // Try to parse booleans
          if (value === 'true' || value === 'false') {
            inputRaw[key] = value === 'true';
          }
        });
      } else {
        try {
          inputRaw = await req.json();
        } catch {
          inputRaw = {};
        }
      }

      // Validate input
      const input = config.input ? config.input.parse(inputRaw) : (inputRaw as I);

      // Execute handler
      const data = await config.handle({ 
        req, 
        input, 
        supabase, 
        user: user! 
      });

      // Validate output
      const result = config.output ? config.output.parse(data) : (data as O);
      
      // Success notification
      if (config.onSuccessNotify) {
        try {
          await config.onSuccessNotify(result);
        } catch (notifyError) {
          console.warn('Success notification failed:', notifyError);
        }
      }

      return NextResponse.json({ ok: true, data: result } as ApiSuccess<O>);

    } catch (err: any) {
      console.error(`API ${config.method} ${new URL(req.url).pathname} failed:`, err);
      
      // Error notification
      if (config.onErrorNotify) {
        try {
          await config.onErrorNotify(err);
        } catch (notifyError) {
          console.warn('Error notification failed:', notifyError);
        }
      }

      const apiError = errorToApiError(err);
      const statusCode = apiError.code === 'VALIDATION_ERROR' ? 400 :
                        apiError.code === 'AUTHENTICATION_ERROR' ? 401 :
                        apiError.code === 'AUTHORIZATION_ERROR' ? 403 : 500;

      return NextResponse.json(
        { ok: false, error: apiError } as ApiError, 
        { status: statusCode }
      );
    }
  };
}

// ============================================================
// PAGINATION HELPERS
// ============================================================

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function createPaginationMeta(total: number, limit: number, offset: number): PaginationMeta {
  return {
    total,
    limit,
    offset,
    hasMore: offset + limit < total
  };
}
