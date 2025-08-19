import { useState, useCallback } from 'react';

interface UniversityInfo {
  university_name: string;
  university_code: string;
  user_info: {
    role: string;
    name: string;
    identifier: string;
  };
}

export const useUniversityInfo = () => {
  const [data, setData] = useState<UniversityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUniversityInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/university', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch university info: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch university info');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchUniversityInfo
  };
};
