import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export interface HodStats {
  registeredStudents: number;
  departmentalCourses: number;
  department: string;
}

export function useHodDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<HodStats>({
    registeredStudents: 1254,
    departmentalCourses: 32,
    department: 'Computer Science'
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
      console.error('Failed to fetch HOD stats:', error);
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
