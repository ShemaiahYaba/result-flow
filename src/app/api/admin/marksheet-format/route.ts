import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Schema for marksheet format column
const MarksheetColumnSchema = z.object({
  id: z.string().uuid(),
  column_name: z.string(),
  type: z.enum(['identifier', 'text', 'score']),
  required: z.boolean(),
  created_at: z.string()
});

const MarksheetColumnInputSchema = z.object({
  column_name: z.string().min(1, 'Column name is required'),
  type: z.enum(['identifier', 'text', 'score']),
  required: z.boolean().default(false)
});

const MarksheetColumnUpdateSchema = MarksheetColumnInputSchema.partial();

const MarksheetColumnsResponseSchema = z.array(MarksheetColumnSchema);

// GET - Fetch all marksheet format columns
export const GET = makeRoute({
  method: 'GET',
  requiredRole: 'admin',
  output: MarksheetColumnsResponseSchema,
  handle: async ({ supabase }) => {
    // Note: This assumes a marksheet_format_columns table exists
    // If it doesn't exist, we'll return default columns
    const { data, error } = await supabase
      .from('marksheet_columns')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      // If table doesn't exist, return default columns
      if (error.code === '42P01') { // relation does not exist
        return [
          {
            id: '1',
            column_name: 'Matric No',
            type: 'identifier' as const,
            required: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            column_name: 'CA',
            type: 'score' as const,
            required: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            column_name: 'Exam',
            type: 'score' as const,
            required: true,
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            column_name: 'Total',
            type: 'score' as const,
            required: false,
            created_at: new Date().toISOString()
          }
        ];
      }
      throw new Error(`Failed to fetch marksheet format: ${error.message}`);
    }

    return data || [];
  }
});

// POST - Create new marksheet format column
export const POST = makeRoute({
  method: 'POST',
  requiredRole: 'admin',
  input: MarksheetColumnInputSchema,
  output: MarksheetColumnSchema,
  handle: async ({ supabase, input }) => {
    // Check for duplicate column name
    const { data: existing, error: checkError } = await supabase
      .from('marksheet_columns')
      .select('id')
      .eq('column_name', input.column_name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check for duplicate column: ${checkError.message}`);
    }

    if (existing) {
      throw new Error('Column name already exists');
    }

    const { data, error } = await supabase
      .from('marksheet_columns')
      .insert([{
        column_name: input.column_name,
        type: input.type,
        required: input.required
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create marksheet column: ${error.message}`);
    }

    return data;
  }
});

// PATCH - Update marksheet format column
export const PATCH = makeRoute({
  method: 'PATCH',
  requiredRole: 'admin',
  input: z.object({
    id: z.string().uuid(),
    ...MarksheetColumnUpdateSchema.shape
  }),
  output: MarksheetColumnSchema,
  handle: async ({ supabase, input }) => {
    const { id, ...updateData } = input;

    // If updating column_name, check for duplicates
    if (updateData.column_name) {
      const { data: existing, error: checkError } = await supabase
        .from('marksheet_columns')
        .select('id')
        .eq('column_name', updateData.column_name)
        .neq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check for duplicate column: ${checkError.message}`);
      }

      if (existing) {
        throw new Error('Column name already exists');
      }
    }

    const { data, error } = await supabase
      .from('marksheet_columns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update marksheet column: ${error.message}`);
    }

    return data;
  }
});

// DELETE - Delete marksheet format column
export const DELETE = makeRoute({
  method: 'DELETE',
  requiredRole: 'admin',
  input: z.object({
    id: z.string().uuid()
  }),
  output: z.object({ success: z.boolean() }),
  handle: async ({ supabase, input }) => {
    const { error } = await supabase
      .from('marksheet_columns')
      .delete()
      .eq('id', input.id);

    if (error) {
      throw new Error(`Failed to delete marksheet column: ${error.message}`);
    }

    return { success: true };
  }
});
