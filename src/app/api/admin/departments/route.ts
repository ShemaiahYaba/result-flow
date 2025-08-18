import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/authMiddleware';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ErrorHandler, ErrorType } from '@/utils/ErrorHandler';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const DepartmentSchema = z.object({
  id: z.string().uuid(),
  department_name: z.string(),
  department_code: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

const CreateDepartmentSchema = z.object({
  department_name: z.string().min(2).max(100),
  department_code: z.string().min(2).max(10).toUpperCase(),
  description: z.string().optional()
});

const DepartmentsResponseSchema = z.object({
  departments: z.array(DepartmentSchema),
  total: z.number().int().min(0)
});

// ============================================================
// GET /api/admin/departments
// Fetch all departments (admin only)
// ============================================================

export const GET = withAuth(
  async (req) => {
    const errorHandler = ErrorHandler.getInstance();
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        const error = errorHandler.createError(
          ErrorType.SYSTEM_CONFIGURATION_ERROR,
          'Supabase configuration missing'
        );
        return NextResponse.json({ ok: false, error }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: departments, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .order('department_name', { ascending: true });

      if (departmentsError) {
        const error = errorHandler.parseSupabaseError(departmentsError);
        return NextResponse.json({ ok: false, error }, { status: 500 });
      }

      const response = {
        departments: departments || [],
        total: departments?.length || 0
      };

      const validatedResponse = DepartmentsResponseSchema.parse(response);

      return NextResponse.json({
        ok: true,
        data: validatedResponse
      });

    } catch (error: any) {
      const appError = errorHandler.handleError(error, {
        context: 'GET /api/admin/departments',
        userId: req.user.id
      });

      return NextResponse.json(
        { ok: false, error: appError },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'admin' }
);

// ============================================================
// POST /api/admin/departments
// Create new department (admin only)
// ============================================================

export const POST = withAuth(
  async (req) => {
    const errorHandler = ErrorHandler.getInstance();
    
    try {
      const body = await req.json();
      const validatedInput = CreateDepartmentSchema.parse(body);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        const error = errorHandler.createError(
          ErrorType.SYSTEM_CONFIGURATION_ERROR,
          'Supabase configuration missing'
        );
        return NextResponse.json({ ok: false, error }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: department, error: insertError } = await supabase
        .from('departments')
        .insert([{
          department_name: validatedInput.department_name,
          department_code: validatedInput.department_code,
          description: validatedInput.description || null,
          is_active: true
        }])
        .select()
        .single();

      if (insertError) {
        const error = errorHandler.parseSupabaseError(insertError);
        return NextResponse.json({ ok: false, error }, { status: 400 });
      }

      const validatedDepartment = DepartmentSchema.parse(department);

      return NextResponse.json({
        ok: true,
        data: validatedDepartment
      }, { status: 201 });

    } catch (error: any) {
      const appError = errorHandler.handleError(error, {
        context: 'POST /api/admin/departments',
        userId: req.user.id
      });

      const status = appError.type === ErrorType.VALIDATION_INVALID_FORMAT ? 400 : 500;

      return NextResponse.json(
        { ok: false, error: appError },
        { status }
      );
    }
  },
  { requiredRole: 'admin' }
);
