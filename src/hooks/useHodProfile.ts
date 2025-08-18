import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export interface HodProfile {
  staff_id: string;
  email: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: string;
  created_at: string;
  department_id: string | null;
  department_name: string | null;
  department_code: string | null;
  university_id: string | null;
}

export interface HodProfileUpdateInput {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

export function useHodProfile() {
  const [profile, setProfile] = useState<HodProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.authenticatedFetch('/api/hod/profile');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch HOD profile');
      }

      // Handle flexible response structure
      const data = result.data || result;
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to fetch HOD profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (input: HodProfileUpdateInput) => {
    setUpdating(true);
    setError(null);
    try {
      const response = await authService.authenticatedFetch('/api/hod/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update HOD profile');
      }

      // Handle flexible response structure
      const updatedData = result.data || result;
      setProfile(updatedData);
      return updatedData;
    } catch (error: any) {
      console.error('Failed to update HOD profile:', error);
      setError(error.message);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,
    refetchProfile: fetchProfile
  };
}
