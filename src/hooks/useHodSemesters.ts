import { useState, useCallback } from 'react';

interface Semester {
  semester_id: string;
  session_name: string;
  semester_name: string;
  display_name: string;
  hod_id: string;
}

export const useHodSemesters = () => {
  const [data, setData] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSemesters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hod/semesters', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
  }, []);

  return {
    data,
    loading,
    error,
    fetchSemesters
  };
};
