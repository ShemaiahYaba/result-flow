import { NextRequest } from 'next/server';
import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';
import { createClient, createServiceClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Schema for grading policy
const GradingPolicySchema = z.object({
  id: z.string().uuid(),
  grade: z.string(),
  min_score: z.number().int(),
  max_score: z.number().int(),
  created_at: z.string()
});

const GradingPolicyInputSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  min_score: z.number().int().min(0, 'Min score must be non-negative'),
  max_score: z.number().int().min(0, 'Max score must be non-negative')
}).refine(data => data.max_score > data.min_score, {
  message: 'Max score must be greater than min score',
  path: ['max_score']
});

const GradingPolicyUpdateSchema = z.object({
  grade: z.string().min(1, 'Grade is required').optional(),
  min_score: z.number().int().min(0, 'Min score must be non-negative').optional(),
  max_score: z.number().int().min(0, 'Max score must be non-negative').optional()
});

const GradingPoliciesResponseSchema = z.array(GradingPolicySchema);

// GET - Fetch all grading policies
export const GET = makeRoute({
  method: 'GET',
  requiredRole: 'admin',
  output: GradingPoliciesResponseSchema,
  handle: async ({ supabase }) => {
    // Use service client for admin operations to bypass RLS
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('grading_policies')
      .select('*')
      .order('min_score', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch grading policies: ${error.message}`);
    }

    return data || [];
  }
});

// POST - Create new grading policy
export const POST = makeRoute({
  method: 'POST',
  requiredRole: 'admin',
  input: GradingPolicyInputSchema,
  output: GradingPolicySchema,
  handle: async ({ supabase, input }) => {
    // Use service client for admin operations to bypass RLS
    const serviceClient = createServiceClient();
    
    // Check for overlapping ranges
    const { data: overlappingPolicies, error: overlapError } = await serviceClient
      .from('grading_policies')
      .select('*')
      .or(`and(min_score.lte.${input.max_score},max_score.gte.${input.min_score})`);

    if (overlapError && overlapError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check for overlapping ranges: ${overlapError.message}`);
    }

    if (overlappingPolicies && overlappingPolicies.length > 0) {
      throw new Error('Score range overlaps with existing grading policy');
    }

    // Check for duplicate grade
    const { data: duplicateGrade, error: gradeError } = await serviceClient
      .from('grading_policies')
      .select('id')
      .eq('grade', input.grade)
      .single();

    if (gradeError && gradeError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check for duplicate grade: ${gradeError.message}`);
    }

    if (duplicateGrade) {
      throw new Error('Grade already exists');
    }

    const { data, error } = await serviceClient
      .from('grading_policies')
      .insert([{
        grade: input.grade,
        min_score: input.min_score,
        max_score: input.max_score
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create grading policy: ${error.message}`);
    }

    return data;
  }
});

// PATCH - Update grading policy
export const PATCH = makeRoute({
  method: 'PATCH',
  requiredRole: 'admin',
  input: z.object({
    id: z.string().uuid(),
    ...GradingPolicyUpdateSchema.shape
  }),
  output: GradingPolicySchema,
  handle: async ({ supabase, input }) => {
    const { id, ...updateData } = input;

    // If updating scores, check for overlapping ranges (excluding current record)
    if (updateData.min_score !== undefined || updateData.max_score !== undefined) {
      const { data: current, error: currentError } = await supabase
        .from('grading_policies')
        .select('min_score, max_score')
        .eq('id', id)
        .single();

      if (currentError) {
        throw new Error(`Failed to fetch current policy: ${currentError.message}`);
      }

      const minScore = updateData.min_score ?? current.min_score;
      const maxScore = updateData.max_score ?? current.max_score;

      if (maxScore <= minScore) {
        throw new Error('Max score must be greater than min score');
      }

      const { data: existing, error: checkError } = await supabase
        .from('grading_policies')
        .select('*')
        .neq('id', id)
        .or(`and(min_score.lte.${maxScore},max_score.gte.${minScore})`);

      if (checkError) {
        throw new Error(`Failed to check for overlapping ranges: ${checkError.message}`);
      }

      if (existing && existing.length > 0) {
        throw new Error('Score range overlaps with existing grading policy');
      }
    }

    // If updating grade, check for duplicates
    if (updateData.grade) {
      const { data: duplicateGrade, error: gradeError } = await supabase
        .from('grading_policies')
        .select('id')
        .eq('grade', updateData.grade)
        .neq('id', id)
        .single();

      if (gradeError && gradeError.code !== 'PGRST116') {
        throw new Error(`Failed to check for duplicate grade: ${gradeError.message}`);
      }

      if (duplicateGrade) {
        throw new Error('Grade already exists');
      }
    }

    const { data, error } = await supabase
      .from('grading_policies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update grading policy: ${error.message}`);
    }

    return data;
  }
});

// DELETE - Delete grading policy
export const DELETE = makeRoute({
  method: 'DELETE',
  requiredRole: 'admin',
  input: z.object({
    id: z.string().uuid()
  }),
  output: z.object({ success: z.boolean() }),
  handle: async ({ supabase, input }) => {
    // Use service client for admin operations to bypass RLS
    const serviceClient = createServiceClient();
    const { error } = await serviceClient
      .from('grading_policies')
      .delete()
      .eq('id', input.id);

    if (error) {
      throw new Error(`Failed to delete grading policy: ${error.message}`);
    }

    return { success: true };
  }
});
