import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authMiddleware, AuthMiddlewareOptions } from './authMiddleware';
import { ErrorHandler, ErrorType } from '@/utils/ErrorHandler';

// ============================================================
// TYPES
// ============================================================

export interface EnhancedRouteContext<I = unknown> {
  req: NextRequest;
  input: I;
  user: {
    id: string;
    email?: string;
    aud: string;
    exp?: number;
  };
  role: 'admin' | 'hod' | 'student';
}

export interface EnhancedHandlerConfig<I, O> {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  input?: z.ZodType<I>;
  output?: z.ZodType<O>;
  auth?: AuthMiddlewareOptions;
  handle: (ctx: EnhancedRouteContext<I>) => Promise<O>;
  onSuccessNotify?: (payload: O) => Promise<void> | void;
  onErrorNotify?: (err: any) => Promise<void> | void;
}

// ============================================================
// ENHANCED ROUTE FACTORY WITH JWT AUTH
// ============================================================

export function makeEnhancedRoute<I = unknown, O = unknown>(config: EnhancedHandlerConfig<I, O>) {
  return async (req: NextRequest) => {
    const errorHandler = ErrorHandler.getInstance();
    
    try {
      // Apply authentication middleware
      const authResult = await authMiddleware(req, config.auth || {});
      
      if (!authResult.success) {
        return NextResponse.json(
          { ok: false, error: authResult.error },
          { status: authResult.status }
        );
      }

      const authenticatedRequest = authResult.request;

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
        req: authenticatedRequest, 
        input, 
        user: authenticatedRequest.user,
        role: authenticatedRequest.role
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

      return NextResponse.json({ ok: true, data: result });

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

      const appError = errorHandler.handleError(err);
      const statusCode = appError.type === ErrorType.VALIDATION_INVALID_FORMAT ? 400 :
                        appError.type === ErrorType.AUTH_INVALID_CREDENTIALS ? 401 :
                        appError.type === ErrorType.AUTH_INSUFFICIENT_PERMISSIONS ? 403 : 500;

      return NextResponse.json(
        { ok: false, error: appError }, 
        { status: statusCode }
      );
    }
  };
}
