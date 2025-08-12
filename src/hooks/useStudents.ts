import { useCallback, useMemo } from 'react';
import { useSupabaseQuery, createQueryConfig } from '../lib/data/useSupabaseQuery';
import { useSupabaseMutation, createInsertConfig, createUpdateConfig, createDeleteConfig } from '../lib/data/useSupabaseMutation';
import { useRealtimeSync, createTableRealtimeConfigs } from '../lib/data/useRealtimeSync';
import { useGlobalContext } from '../contexts/GlobalContext';
import { 
  StudentInput, 
  StudentWithJoins,
  CreateStudentInput, 
  UpdateStudentInput, 
  StudentSearchInput,
  BulkStudentInput 
} from '../lib/validation/students.schema';
import { validateData } from '../lib/validation';

export interface UseStudentsOptions {
  departmentId?: string;
  sessionId?: string;
  level?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
  enableRealtime?: boolean;
}

export interface UseStudentsReturn {
  // Query results
  students: StudentWithJoins[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Mutations
  createStudent: ReturnType<typeof useSupabaseMutation<StudentInput, CreateStudentInput>>;
  updateStudent: ReturnType<typeof useSupabaseMutation<StudentInput, UpdateStudentInput>>;
  deleteStudent: ReturnType<typeof useSupabaseMutation<StudentInput, { id: string }>>;
  bulkCreateStudents: ReturnType<typeof useSupabaseMutation<StudentInput[], BulkStudentInput>>;
  
  // Utilities
  refetch: () => void;
  searchStudents: (searchParams: StudentSearchInput) => void;
  getStudentById: (id: string) => StudentWithJoins | undefined;
  getStudentsByDepartment: (departmentId: string) => StudentWithJoins[];
  getStudentsBySession: (sessionId: string) => StudentWithJoins[];
}

export function useStudents(
  supabase: any,
  options: UseStudentsOptions = {}
): UseStudentsReturn {
  const { state } = useGlobalContext();
  const { user } = state.auth;

  // Build query filters based on options
  const filters = useMemo(() => {
    const filterObj: Record<string, any> = {};
    
    if (options.departmentId) {
      filterObj.department_id = options.departmentId;
    }
    
    if (options.sessionId) {
      filterObj.session_id = options.sessionId;
    }
    
    if (options.level) {
      filterObj.level = options.level;
    }
    
    if (options.searchTerm) {
      // For text search, we'll need to handle this in the query
      filterObj.search = options.searchTerm;
    }
    
    return filterObj;
  }, [options.departmentId, options.sessionId, options.level, options.searchTerm]);

  // Create query configuration
  const queryConfig = useMemo(() => createQueryConfig<StudentWithJoins[]>(
    'students',
    ['students', filters, options.limit, options.offset],
    {
      select: `
        *,
        profiles!students_profile_id_fkey (
          id,
          full_name,
          email,
          phone_number,
          role
        ),
        departments!students_department_id_fkey (
          id,
          department_name,
          department_code
        ),
        academic_sessions!students_session_id_fkey (
          id,
          session_name,
          is_active
        )
      `,
      filters,
      orderBy: { column: 'created_at', ascending: false },
      limit: options.limit || 50,
      offset: options.offset || 0,
      enabled: options.enabled !== false
    }
  ), [filters, options.limit, options.offset, options.enabled]);

  // Main query
  const query = useSupabaseQuery(supabase, {
    config: queryConfig
  });

  // Real-time sync
  const realtimeConfigs = useMemo(() => 
    createTableRealtimeConfigs('students', ['students']),
    []
  );

  useRealtimeSync(supabase, {
    configs: realtimeConfigs,
    enabled: options.enableRealtime !== false && !!user
  });

  // Mutations
  const createStudent = useSupabaseMutation(supabase, {
    config: createInsertConfig<StudentInput, CreateStudentInput>(
      'students',
      [['students']],
      {
        onSuccess: (data, variables) => {
          console.log('Student created:', data);
        }
      }
    )
  });

  const updateStudent = useSupabaseMutation(supabase, {
    config: createUpdateConfig<StudentInput, UpdateStudentInput>(
      'students',
      [['students']],
      {
        onSuccess: (data, variables) => {
          console.log('Student updated:', data);
        }
      }
    )
  });

  const deleteStudent = useSupabaseMutation(supabase, {
    config: createDeleteConfig<StudentInput, { id: string }>(
      'students',
      [['students']],
      {
        onSuccess: (data, variables) => {
          console.log('Student deleted:', data);
        }
      }
    )
  });

  const bulkCreateStudents = useSupabaseMutation(supabase, {
    config: createInsertConfig<StudentInput[], BulkStudentInput>(
      'students',
      [['students']],
      {
        onSuccess: (data, variables) => {
          console.log('Students bulk created:', data);
        }
      }
    )
  });

  // Utility functions
  const searchStudents = useCallback((searchParams: StudentSearchInput) => {
    const validation = validateData(StudentSearchInput, searchParams);
    if (!validation.success) {
      console.error('Invalid search parameters:', validation.errors);
      return;
    }
    
    // This would typically trigger a new query with search filters
    // For now, we'll just log the search parameters
    console.log('Searching students with:', searchParams);
  }, []);

  const getStudentById = useCallback((id: string): StudentWithJoins | undefined => {
    return query.data?.find(student => student.id === id);
  }, [query.data]);

  const getStudentsByDepartment = useCallback((departmentId: string): StudentWithJoins[] => {
    return query.data?.filter(student => student.department_id === departmentId) || [];
  }, [query.data]);

  const getStudentsBySession = useCallback((sessionId: string): StudentWithJoins[] => {
    return query.data?.filter(student => student.session_id === sessionId) || [];
  }, [query.data]);

  return {
    // Query results
    students: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Mutations
    createStudent,
    updateStudent,
    deleteStudent,
    bulkCreateStudents,
    
    // Utilities
    refetch: query.refetch,
    searchStudents,
    getStudentById,
    getStudentsByDepartment,
    getStudentsBySession
  };
}

// Specialized hooks for common use cases
export function useStudentsByDepartment(
  supabase: any,
  departmentId: string,
  options?: Omit<UseStudentsOptions, 'departmentId'>
) {
  return useStudents(supabase, { ...options, departmentId });
}

export function useStudentsBySession(
  supabase: any,
  sessionId: string,
  options?: Omit<UseStudentsOptions, 'sessionId'>
) {
  return useStudents(supabase, { ...options, sessionId });
}

export function useStudentById(
  supabase: any,
  studentId: string,
  options?: Omit<UseStudentsOptions, 'enabled'>
) {
  const queryConfig = createQueryConfig<StudentWithJoins>(
    'students',
    ['students', studentId],
    {
      select: `
        *,
        profiles!students_profile_id_fkey (
          id,
          full_name,
          email,
          phone_number,
          role
        ),
        departments!students_department_id_fkey (
          id,
          department_name,
          department_code
        ),
        academic_sessions!students_session_id_fkey (
          id,
          session_name,
          is_active
        )
      `,
      filters: { id: studentId },
      enabled: !!studentId
    }
  );

  const query = useSupabaseQuery(supabase, { config: queryConfig });

  return {
    student: query.data?.[0],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
} 