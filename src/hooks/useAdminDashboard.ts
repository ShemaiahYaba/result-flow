import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/UnifiedAuthProvider';
import { authService } from '@/services/authService';

export interface AdminStats {
  totalHods: number;
  departments: number;
  courses: number;
  pendingApprovals: number;
}

export function useAdminDashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalHods: 0,
    departments: 0,
    courses: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.authenticatedFetch('/api/admin/dashboard');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch dashboard stats');
      }

      // Handle flexible response structure
      const data = result.data || result;
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch admin stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    signOut,
    refetchStats: fetchStats
  };
}
