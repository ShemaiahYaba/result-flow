import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Authentication required');
  }

  // Get user role from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    role: profile?.role,
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
        user = await getAuthenticatedUser(req);
        
        // Role-based authorization
        if (config.requiredRole && !checkRolePermission(user.role, config.requiredRole)) {
          throw new Error('Insufficient permissions for this operation');
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
