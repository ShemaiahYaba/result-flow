import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export interface GradingPolicy {
  id: string;
  policy_name: string;
  min_score: number;
  max_score: number;
  grade: string;
  grade_point: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GradingPolicyInput {
  policy_name: string;
  min_score: number;
  max_score: number;
  grade: string;
  grade_point: number;
  description?: string;
}

export function useGradingPolicy() {
  const [policies, setPolicies] = useState<GradingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.authenticatedFetch('/api/admin/grading-policy');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch grading policies');
      }

      const data = result.data || result;
      setPolicies(data);
    } catch (error: any) {
      console.error('Failed to fetch grading policies:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (input: GradingPolicyInput) => {
    try {
      const response = await authService.authenticatedFetch('/api/admin/grading-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create grading policy');
      }

      const newPolicy = result.data || result;
      setPolicies(prev => [...prev, newPolicy].sort((a, b) => b.min_score - a.min_score));
      return newPolicy;
    } catch (error: any) {
      console.error('Failed to create grading policy:', error);
      throw error;
    }
  };

  const updatePolicy = async (id: string, input: Partial<GradingPolicyInput>) => {
    try {
      const response = await authService.authenticatedFetch('/api/admin/grading-policy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...input }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update grading policy');
      }

      const updatedPolicy = result.data || result;
      setPolicies(prev => 
        prev.map(p => p.id === id ? updatedPolicy : p)
           .sort((a, b) => b.min_score - a.min_score)
      );
      return updatedPolicy;
    } catch (error: any) {
      console.error('Failed to update grading policy:', error);
      throw error;
    }
  };

  const deletePolicy = async (id: string) => {
    try {
      const response = await authService.authenticatedFetch('/api/admin/grading-policy', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete grading policy');
      }

      setPolicies(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Failed to delete grading policy:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return {
    policies,
    loading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    refetchPolicies: fetchPolicies
  };
}
