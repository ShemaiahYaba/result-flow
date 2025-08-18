import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export interface Hod {
  id: string;
  profile_id: string;
  department_id: string;
  university_id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  staff_id: string;
  department_name: string;
  department_code: string;
  name: string;
  status: string;
}

export function useManageHods() {
  const [hods, setHods] = useState<Hod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHods = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.authenticatedFetch('/api/admin/manage-hods');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch HODs');
      }

      // Handle flexible response structure
      const data = result.data || result;
      setHods(data);
    } catch (error: any) {
      console.error('Failed to fetch HODs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHods();
  }, []);

  return {
    hods,
    loading,
    error,
    refetchHods: fetchHods
  };
}
