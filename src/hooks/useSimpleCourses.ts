import { useState, useCallback } from 'react';
import { useAuth } from '@/providers/UnifiedAuthProvider';

interface Course {
  id: string;
  course_code: string;
  course_title: string;
  course_unit: number;
  level: number;
  semester: string;
  is_active: boolean;
}

export const useSimpleCourses = () => {
  const { authenticatedFetch } = useAuth();
  const [data, setData] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/student/courses');

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data?.items || result.items || result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  return {
    data,
    loading,
    error,
    fetchCourses
  };
};
