import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/UnifiedAuthProvider';

interface BroadsheetStudent {
  student_id: string;
  matric_number: string;
  full_name: string;
  level: number;
  gpa: number | null;
  course_scores: Record<string, number | null>;
}

interface Course {
  course_id: string;
  course_code: string;
  course_title: string;
  course_unit: number;
}

interface BroadsheetData {
  semester_info: {
    semester_id: string;
    semester_name: string;
    academic_year: string;
  };
  department_info: {
    department_name: string;
    department_code: string;
  };
  courses: Course[];
  students: BroadsheetStudent[];
  summary: {
    total_students: number;
    students_with_results: number;
    average_gpa: number | null;
  };
}

export function useHodBroadsheet() {
  const { authenticatedFetch } = useAuth();
  const [data, setData] = useState<BroadsheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBroadsheet = async (semester_id: string, level?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ semester_id });
      if (level) params.append('level', level);
      
      const response = await authenticatedFetch(`/api/hod/broadsheet?${params}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch broadsheet data');
      }
      
      setData(result.data || result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching broadsheet:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchBroadsheet
  };
}
