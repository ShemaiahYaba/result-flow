import { useState, useCallback } from 'react';

interface StudentProfile {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone_number: string | null;
  department_name: string;
  department_id: string;
  matric_number: string;
  university_id: string;
  role: string;
  created_at: string;
}

interface UpdateProfileData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

export const useStudentProfile = () => {
  const [data, setData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: UpdateProfileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh profile data after successful update
      await fetchProfile();
      
      return result.data || result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  return {
    data,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};
