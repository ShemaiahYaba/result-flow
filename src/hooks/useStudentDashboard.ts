import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/UnifiedAuthProvider';

export interface StudentResult {
  code: string;
  title: string;
  units: number;
  grade: string;
  score: number;
}

export interface StudentStats {
  cgpa: number | null;
  gpa: number | null;
  semester: string | null;
  currentResults: StudentResult[];
  student_info: {
    first_name: string;
    last_name: string;
    matric_number: string;
    department_name: string;
    university_name: string;
  } | null;
  academic_summary: {
    current_level: number | null;
    total_units_attempted: number;
    total_units_passed: number;
    total_semesters: number;
  } | null;
}

export function useStudentDashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    cgpa: null,
    gpa: null,
    semester: null,
    currentResults: [],
    student_info: null,
    academic_summary: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authenticatedFetch } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch CGPA data from dedicated endpoint
      const cgpaResponse = await authenticatedFetch('/api/student/results/cgpa', {
        method: 'GET',
      });

      let cgpaData = null;
      if (cgpaResponse.ok) {
        cgpaData = await cgpaResponse.json();
      }

      // Fetch dashboard data
      const dashboardResponse = await authenticatedFetch('/api/student/dashboard', {
        method: 'GET',
      });

      let dashboardData = null;
      if (dashboardResponse.ok) {
        const result = await dashboardResponse.json();
        dashboardData = result.data || result;
      }

      setStats({
        cgpa: cgpaData?.cgpa || null,
        gpa: dashboardData?.recent_results?.[0]?.semester_gpa || null,
        semester: dashboardData?.academic_summary?.current_semester || null,
        currentResults: [], // Will be populated from results API
        student_info: dashboardData?.student_info || null,
        academic_summary: {
          ...dashboardData?.academic_summary,
          total_units_attempted: cgpaData?.total_units || 0,
          total_grade_points: cgpaData?.total_grade_points || 0
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Failed to fetch student dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  const downloadTranscript = async () => {
    // TODO: Implement transcript download
    alert('Transcript download functionality to be implemented');
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    loading,
    error,
    signOut,
    downloadTranscript,
    refetchResults: fetchDashboardData
  };
}
