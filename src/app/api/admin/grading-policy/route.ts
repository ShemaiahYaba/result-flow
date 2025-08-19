import { NextRequest } from 'next/server';
import { z } from 'zod';
import { makeRoute } from '@/lib/api/routeFactory';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const GradingPolicySchema = z.object({
  id: z.string().uuid(),
  policy_name: z.string(),
  min_score: z.number().min(0).max(100),
  max_score: z.number().min(0).max(100),
  grade: z.string(),
  grade_point: z.number().min(0).max(5),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

const GradingPoliciesResponseSchema = z.array(GradingPolicySchema);

const CreateGradingPolicySchema = z.object({
  policy_name: z.string().min(1, "Policy name is required"),
  min_score: z.number().min(0).max(100),
  max_score: z.number().min(0).max(100),
  grade: z.string().min(1, "Grade is required"),
  grade_point: z.number().min(0).max(5),
  description: z.string().optional()
}).refine(data => data.max_score >= data.min_score, {
  message: "Max score must be greater than or equal to min score",
  path: ["max_score"]
});

const UpdateGradingPolicySchema = z.object({
  policy_name: z.string().min(1).optional(),
  min_score: z.number().min(0).max(100).optional(),
  max_score: z.number().min(0).max(100).optional(),
  grade: z.string().min(1).optional(),
  grade_point: z.number().min(0).max(5).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional()
});

// ============================================================
// GET - FETCH GRADING POLICIES
// ============================================================

export const GET = makeRoute({
  method: 'GET',
  requiredRole: 'admin',
  output: GradingPoliciesResponseSchema,
  handle: async ({ supabase, user }) => {
    // Get admin's university to filter grading policies
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (!adminData) {
      throw new Error('Admin not found');
    }

    // Fetch grading policies for admin's university
    const { data: policies, error } = await supabase
      .from('grading_policies')
      .select('*')
      .eq('university_id', adminData.university_id)
      .eq('is_active', true)
      .order('min_score', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch grading policies: ${error.message}`);
    }

    return policies || [];
  }
});

// ============================================================
// POST - CREATE GRADING POLICY
// ============================================================

export const POST = makeRoute({
  method: 'POST',
  input: CreateGradingPolicySchema,
  output: GradingPolicySchema,
  requiredRole: 'admin',
  handle: async ({ supabase, user, input }) => {
    // Get admin's university
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (!adminData) {
      throw new Error('Admin not found');
    }

    // Check for overlapping score ranges
    const { data: existingPolicies } = await supabase
      .from('grading_policies')
      .select('id, min_score, max_score')
      .eq('university_id', adminData.university_id)
      .eq('is_active', true);

    const hasOverlap = existingPolicies?.some(policy => 
      (input.min_score >= policy.min_score && input.min_score <= policy.max_score) ||
      (input.max_score >= policy.min_score && input.max_score <= policy.max_score) ||
      (input.min_score <= policy.min_score && input.max_score >= policy.max_score)
    );

    if (hasOverlap) {
      throw new Error('Score range overlaps with existing grading policy');
    }

    // Create the grading policy
    const { data: newPolicy, error: createError } = await supabase
      .from('grading_policies')
      .insert({
        university_id: adminData.university_id,
        policy_name: input.policy_name,
        min_score: input.min_score,
        max_score: input.max_score,
        grade: input.grade,
        grade_point: input.grade_point,
        description: input.description || null
      })
      .select('*')
      .single();

    if (createError) {
      throw new Error(`Failed to create grading policy: ${createError.message}`);
    }

    if (!newPolicy) {
      throw new Error('Failed to create grading policy');
    }

    return newPolicy;
  }
});

// ============================================================
// PATCH - UPDATE GRADING POLICY
// ============================================================

export const PATCH = makeRoute({
  method: 'PATCH',
  input: z.object({
    id: z.string().uuid(),
    ...UpdateGradingPolicySchema.shape
  }),
  output: GradingPolicySchema,
  requiredRole: 'admin',
  handle: async ({ supabase, user, input }) => {
    const { id, ...updateData } = input;

    // Get admin's university to ensure they can only update their policies
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (!adminData) {
      throw new Error('Admin not found');
    }

    // Verify the policy belongs to admin's university
    const { data: existingPolicy } = await supabase
      .from('grading_policies')
      .select('id, university_id, min_score, max_score')
      .eq('id', id)
      .eq('university_id', adminData.university_id)
      .single();

    if (!existingPolicy) {
      throw new Error('Grading policy not found or access denied');
    }

    // If updating score ranges, check for overlaps
    if (updateData.min_score !== undefined || updateData.max_score !== undefined) {
      const { data: otherPolicies } = await supabase
        .from('grading_policies')
        .select('id, min_score, max_score')
        .eq('university_id', adminData.university_id)
        .eq('is_active', true)
        .neq('id', id);

      const newMinScore = updateData.min_score ?? existingPolicy.min_score;
      const newMaxScore = updateData.max_score ?? existingPolicy.max_score;

      const hasOverlap = otherPolicies?.some(policy => 
        (newMinScore >= policy.min_score && newMinScore <= policy.max_score) ||
        (newMaxScore >= policy.min_score && newMaxScore <= policy.max_score) ||
        (newMinScore <= policy.min_score && newMaxScore >= policy.max_score)
      );

      if (hasOverlap) {
        throw new Error('Updated score range overlaps with existing grading policy');
      }
    }

    // Update the policy
    const { data: updatedPolicy, error: updateError } = await supabase
      .from('grading_policies')
      .update(updateData)
      .eq('id', id)
      .eq('university_id', adminData.university_id)
      .select('*')
      .single();

    if (updateError) {
      throw new Error(`Failed to update grading policy: ${updateError.message}`);
    }

    if (!updatedPolicy) {
      throw new Error('Grading policy not found');
    }

    return updatedPolicy;
  }
});

// ============================================================
// DELETE - DELETE GRADING POLICY
// ============================================================

export const DELETE = makeRoute({
  method: 'DELETE',
  input: z.object({
    id: z.string().uuid()
  }),
  output: z.object({ success: z.boolean() }),
  requiredRole: 'admin',
  handle: async ({ supabase, user, input }) => {
    // Get admin's university to ensure they can only delete their policies
    const { data: userData } = await supabase
      .from('users')
      .select('user_entity_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData) {
      throw new Error('User not found');
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', userData.user_entity_id)
      .single();

    if (!adminData) {
      throw new Error('Admin not found');
    }

    // Verify the policy belongs to admin's university and delete it
    const { error } = await supabase
      .from('grading_policies')
      .delete()
      .eq('id', input.id)
      .eq('university_id', adminData.university_id);

    if (error) {
      throw new Error(`Failed to delete grading policy: ${error.message}`);
    }

    return { success: true };
  }
});
