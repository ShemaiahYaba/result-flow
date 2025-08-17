import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export interface AdminStats {
  totalHods: number;
  departments: number;
  courses: number;
  pendingApprovals: number;
}

export function useAdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalHods: 3,
    departments: 5,
    courses: 20,
    pendingApprovals: 2,
  });
  const [loading, setLoading] = useState(false);

  // TODO: Replace with actual API calls
  const fetchStats = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, fetch from your API
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
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
    logout,
    refetchStats: fetchStats
  };
}
