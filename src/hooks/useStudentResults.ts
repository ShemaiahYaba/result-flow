import { useState, useCallback } from 'react';

interface CourseResult {
  result_id: string;
  course_code: string;
  course_title: string;
  course_unit: number;
  score: number;
  grade: string;
  status: string;
  created_at: string;
}

interface SemesterResults {
  semester_id: string;
  session_name: string;
  semester_name: string;
  level: number;
  semester_gpa: number | null;
  total_units_attempted: number;
  total_units_passed: number;
  courses: CourseResult[];
}

interface StudentResultsData {
  student_info: {
    matric_number: string;
    full_name: string;
    department_name: string;
    university_name: string;
  };
  academic_summary: {
    total_semesters: number;
    cumulative_gpa: number | null;
    total_units_attempted: number;
    total_units_passed: number;
  };
  semester_results: SemesterResults[];
}

interface UseStudentResultsFilters {
  session_id?: string;
  semester_id?: string;
  level?: number;
}

export const useStudentResults = () => {
  const [data, setData] = useState<StudentResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (filters?: UseStudentResultsFilters) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.session_id) {
        queryParams.append('session_id', filters.session_id);
      }
      if (filters?.semester_id) {
        queryParams.append('semester_id', filters.semester_id);
      }
      if (filters?.level) {
        queryParams.append('level', filters.level.toString());
      }

      const url = `/api/student/results${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, []);

  const getResultsByLevel = useCallback((level: number) => {
    if (!data) return [];
    return data.semester_results.filter(semester => semester.level === level);
  }, [data]);

  const getResultsBySession = useCallback((sessionName: string) => {
    if (!data) return [];
    return data.semester_results.filter(semester => semester.session_name === sessionName);
  }, [data]);

  const getAvailableSessions = useCallback(() => {
    if (!data) return [];
    const sessions = [...new Set(data.semester_results.map(s => s.session_name))];
    return sessions.sort().reverse(); // Most recent first
  }, [data]);

  const getAvailableLevels = useCallback(() => {
    if (!data) return [];
    const levels = [...new Set(data.semester_results.map(s => s.level))];
    return levels.sort(); // Ascending order
  }, [data]);

  return {
    data,
    loading,
    error,
    fetchResults,
    getResultsByLevel,
    getResultsBySession,
    getAvailableSessions,
    getAvailableLevels
  };
};
