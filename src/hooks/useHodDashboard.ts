import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/UnifiedAuthProvider';

export interface HodStats {
  registeredStudents: number;
  departmentalCourses: number;
  department: string;
  departmentCode: string;
  university: string;
  hodName: string;
  staffId: string;
}

export function useHodDashboard() {
  const { signOut, authenticatedFetch } = useAuth();
  const [stats, setStats] = useState<HodStats>({
    registeredStudents: 0,
    departmentalCourses: 0,
    department: '',
    departmentCode: '',
    university: '',
    hodName: '',
    staffId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('/api/hod/dashboard');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
      
      const data = result.data || result;
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch HOD stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
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
