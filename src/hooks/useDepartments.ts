import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/UnifiedAuthProvider';

export interface Department {
  id: string;
  department_name: string;
  department_code: string;
  created_at: string;
  university_id: string | null;
  hod: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export function useDepartments() {
  const { authenticatedFetch } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch('/api/admin/departments');
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle session expired specifically
        if (errorData.error?.code === 'SESSION_EXPIRED') {
          // Redirect to login or trigger re-authentication
          window.location.href = '/';
          return;
        }
        
        throw new Error(errorData.error?.message || 'Failed to fetch departments');
      }
      
      const result = await response.json();
      setDepartments(result.data || result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments');
      console.error('Departments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
  };
}
