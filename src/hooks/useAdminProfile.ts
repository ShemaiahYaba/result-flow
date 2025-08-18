import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/UnifiedAuthProvider';

export interface AdminProfile {
  staff_id: string;
  id: string;
  email: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone_number?: string;
}

export function useAdminProfile() {
  const { authenticatedFetch } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authenticatedFetch('/api/admin/profile');
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle session expired specifically
        if (errorData.error?.code === 'SESSION_EXPIRED') {
          // Redirect to login or trigger re-authentication
          window.location.href = '/';
          return;
        }
        
        throw new Error(errorData.error?.message || 'Failed to fetch profile');
      }
      
      const result = await response.json();
      setProfile(result.data || result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: UpdateProfileData) => {
    try {
      setUpdating(true);
      setError(null);
      
      const response = await authenticatedFetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update profile');
      }
      
      const result = await response.json();
      const updatedProfile = result.data || result;
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Profile update error:', err);
      throw err;
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
    fetchProfile,
    updateProfile,
  };
}
