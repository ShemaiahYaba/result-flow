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

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/student/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const result = await response.json();
      const data = result.data || result;

      setStats({
        cgpa: data.academic_summary?.cumulative_gpa || null,
        gpa: data.recent_results?.[0]?.semester_gpa || null,
        semester: data.academic_summary?.current_semester || null,
        currentResults: [], // Will be populated from results API
        student_info: data.student_info,
        academic_summary: data.academic_summary
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Failed to fetch student dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
