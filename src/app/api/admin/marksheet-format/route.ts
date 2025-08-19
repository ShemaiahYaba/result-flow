import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// Schema for marksheet format column (matching database schema)
const MarksheetColumnSchema = z.object({
  id: z.string().uuid(),
  column_name: z.string(),
  display_name: z.string(),
  column_type: z.enum(['identifier', 'text', 'score']),
  is_required: z.boolean(),
  column_order: z.number(),
  validation_rules: z.any().nullable(),
  is_active: z.boolean(),
  university_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string()
});

const MarksheetColumnInputSchema = z.object({
  column_name: z.string().min(1, 'Column name is required'),
  display_name: z.string().min(1, 'Display name is required'),
  column_type: z.enum(['identifier', 'text', 'score']),
  is_required: z.boolean().default(false),
  column_order: z.number().default(0),
  validation_rules: z.any().optional()
});

const MarksheetColumnUpdateSchema = MarksheetColumnInputSchema.partial();

const MarksheetColumnsResponseSchema = z.array(MarksheetColumnSchema);

// GET - Fetch all marksheet format columns for admin's university
export const GET = makeRoute({
  method: 'GET',
  requiredRole: 'admin',
  output: MarksheetColumnsResponseSchema,
  handle: async ({ supabase, user }) => {
    // Get admin's university through user lookup
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (adminError || !adminData) {
      throw new Error('Admin not found');
    }

    // Fetch marksheet columns for admin's university
    const { data, error } = await supabase
      .from('marksheet_columns')
      .select('*')
      .eq('university_id', adminData.university_id)
      .order('created_at', { ascending: true });

    if (error) {
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
  handle: async ({ supabase, input, user }) => {
    // Get admin's university through user lookup
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (adminError || !adminData) {
      throw new Error('Admin not found');
    }

    // Check for duplicate column name within the same university
    const { data: existing, error: checkError } = await supabase
      .from('marksheet_columns')
      .select('id')
      .eq('column_name', input.column_name)
      .eq('university_id', adminData.university_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check for duplicate column: ${checkError.message}`);
    }

    if (existing) {
      throw new Error('Column name already exists in your university');
    }

    const { data, error } = await supabase
      .from('marksheet_columns')
      .insert([{
        column_name: input.column_name,
        display_name: input.display_name,
        column_type: input.column_type,
        is_required: input.is_required,
        column_order: input.column_order || 0,
        validation_rules: input.validation_rules || null,
        university_id: adminData.university_id
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
  handle: async ({ supabase, input, user }) => {
    const { id, ...updateData } = input;

    // Get admin's university through user lookup
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (adminError || !adminData) {
      throw new Error('Admin not found');
    }

    // Verify the column belongs to admin's university
    const { data: columnData, error: columnError } = await supabase
      .from('marksheet_columns')
      .select('university_id')
      .eq('id', id)
      .single();

    if (columnError || !columnData) {
      throw new Error('Marksheet column not found');
    }

    if (columnData.university_id !== adminData.university_id) {
      throw new Error('You can only update columns from your university');
    }

    // If updating column_name, check for duplicates within the same university
    if (updateData.column_name) {
      const { data: existing, error: checkError } = await supabase
        .from('marksheet_columns')
        .select('id')
        .eq('column_name', updateData.column_name)
        .eq('university_id', adminData.university_id)
        .neq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check for duplicate column: ${checkError.message}`);
      }

      if (existing) {
        throw new Error('Column name already exists in your university');
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
  handle: async ({ supabase, input, user }) => {
    // Get admin's university through user lookup
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (adminError || !adminData) {
      throw new Error('Admin not found');
    }

    // Verify the column belongs to admin's university before deletion
    const { data: columnData, error: columnError } = await supabase
      .from('marksheet_columns')
      .select('university_id')
      .eq('id', input.id)
      .single();

    if (columnError || !columnData) {
      throw new Error('Marksheet column not found');
    }

    if (columnData.university_id !== adminData.university_id) {
      throw new Error('You can only delete columns from your university');
    }

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
