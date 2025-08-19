import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/UnifiedAuthProvider';

interface Semester {
  semester_id: string;
  session_name: string;
  semester_name: string;
  display_name: string;
  hod_id: string;
}

export const useHodSemesters = () => {
  const { authenticatedFetch } = useAuth();
  const [data, setData] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSemesters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/hod/semesters');

      if (!response.ok) {
        throw new Error(`Failed to fetch semesters: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch semesters');
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return {
    data,
    loading,
    error,
    fetchSemesters
  };
};
