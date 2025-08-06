import { useCallback, useMemo } from 'react';
import { useSupabaseQuery, createQueryConfig } from '../lib/data/useSupabaseQuery';
import { useSupabaseMutation, createInsertConfig, createUpdateConfig, createDeleteConfig } from '../lib/data/useSupabaseMutation';
import { useRealtimeSync, createTableRealtimeConfigs } from '../lib/data/useRealtimeSync';
import { useGlobalContext } from '../contexts/GlobalContext';
import { 
  ResultInput, 
  CreateResultInput, 
  UpdateResultInput, 
  ResultSearchInput,
  BulkResultInput 
} from '../lib/validation/results.schema';
import { validateData } from '../lib/validation';

export interface UseResultsOptions {
  studentId?: string;
  courseId?: string;
  sessionId?: string;
  departmentId?: string;
  status?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
  enableRealtime?: boolean;
}

export interface UseResultsReturn {
  // Query results
  results: ResultInput[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Mutations
  createResult: ReturnType<typeof useSupabaseMutation<ResultInput, CreateResultInput>>;
  updateResult: ReturnType<typeof useSupabaseMutation<ResultInput, UpdateResultInput>>;
  deleteResult: ReturnType<typeof useSupabaseMutation<ResultInput, { id: string }>>;
  bulkCreateResults: ReturnType<typeof useSupabaseMutation<ResultInput[], BulkResultInput>>;
  
  // Utilities
  refetch: () => void;
  searchResults: (searchParams: ResultSearchInput) => void;
  getResultById: (id: string) => ResultInput | undefined;
  getResultsByStudent: (studentId: string) => ResultInput[];
  getResultsByCourse: (courseId: string) => ResultInput[];
  getResultsBySession: (sessionId: string) => ResultInput[];
  getResultsByDepartment: (departmentId: string) => ResultInput[];
  getResultsByStatus: (status: string) => ResultInput[];
}

export function useResults(
  supabase: any,
  options: UseResultsOptions = {}
): UseResultsReturn {
  const { state } = useGlobalContext();
  const { user } = state.auth;

  // Build query filters based on options
  const filters = useMemo(() => {
    const filterObj: Record<string, any> = {};
    
    if (options.studentId) {
      filterObj.student_id = options.studentId;
    }
    
    if (options.courseId) {
      filterObj.course_id = options.courseId;
    }
    
    if (options.sessionId) {
      filterObj.session_id = options.sessionId;
    }
    
    if (options.departmentId) {
      filterObj.department_id = options.departmentId;
    }
    
    if (options.status) {
      filterObj.status = options.status;
    }
    
    if (options.searchTerm) {
      // For text search, we'll need to handle this in the query
      filterObj.search = options.searchTerm;
    }
    
    return filterObj;
  }, [options.studentId, options.courseId, options.sessionId, options.departmentId, options.status, options.searchTerm]);

  // Create query configuration
  const queryConfig = useMemo(() => createQueryConfig<ResultInput[]>(
    'results',
    ['results', filters, options.limit, options.offset],
    {
      select: `
        *,
        students!results_student_id_fkey (
          id,
          matric_number,
          full_name,
          level,
          department_id
        ),
        courses!results_course_id_fkey (
          id,
          course_code,
          course_title,
          credit_units,
          department_id
        ),
        academic_sessions!results_session_id_fkey (
          id,
          session_name,
          is_active
        ),
        departments!results_department_id_fkey (
          id,
          department_name,
          department_code
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
    createTableRealtimeConfigs('results', ['results']),
    []
  );

  useRealtimeSync(supabase, {
    configs: realtimeConfigs,
    enabled: options.enableRealtime !== false && !!user
  });

  // Mutations
  const createResult = useSupabaseMutation(supabase, {
    config: createInsertConfig<ResultInput, CreateResultInput>(
      'results',
      [['results']],
      {
        onSuccess: (data, variables) => {
          console.log('Result created:', data);
        }
      }
    )
  });

  const updateResult = useSupabaseMutation(supabase, {
    config: createUpdateConfig<ResultInput, UpdateResultInput>(
      'results',
      [['results']],
      {
        onSuccess: (data, variables) => {
          console.log('Result updated:', data);
        }
      }
    )
  });

  const deleteResult = useSupabaseMutation(supabase, {
    config: createDeleteConfig<ResultInput, { id: string }>(
      'results',
      [['results']],
      {
        onSuccess: (data, variables) => {
          console.log('Result deleted:', data);
        }
      }
    )
  });

  const bulkCreateResults = useSupabaseMutation(supabase, {
    config: createInsertConfig<ResultInput[], BulkResultInput>(
      'results',
      [['results']],
      {
        onSuccess: (data, variables) => {
          console.log('Results bulk created:', data);
        }
      }
    )
  });

  // Utility functions
  const searchResults = useCallback((searchParams: ResultSearchInput) => {
    const validation = validateData(ResultSearchInput, searchParams);
    if (!validation.success) {
      console.error('Invalid search parameters:', validation.errors);
      return;
    }
    
    // This would typically trigger a new query with search filters
    // For now, we'll just log the search parameters
    console.log('Searching results with:', searchParams);
  }, []);

  const getResultById = useCallback((id: string): ResultInput | undefined => {
    return query.data?.find(result => result.id === id);
  }, [query.data]);

  const getResultsByStudent = useCallback((studentId: string): ResultInput[] => {
    return query.data?.filter(result => result.student_id === studentId) || [];
  }, [query.data]);

  const getResultsByCourse = useCallback((courseId: string): ResultInput[] => {
    return query.data?.filter(result => result.course_id === courseId) || [];
  }, [query.data]);

  const getResultsBySession = useCallback((sessionId: string): ResultInput[] => {
    return query.data?.filter(result => result.session_id === sessionId) || [];
  }, [query.data]);

  const getResultsByDepartment = useCallback((departmentId: string): ResultInput[] => {
    return query.data?.filter(result => result.department_id === departmentId) || [];
  }, [query.data]);

  const getResultsByStatus = useCallback((status: string): ResultInput[] => {
    return query.data?.filter(result => result.status === status) || [];
  }, [query.data]);

  return {
    // Query results
    results: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Mutations
    createResult,
    updateResult,
    deleteResult,
    bulkCreateResults,
    
    // Utilities
    refetch: query.refetch,
    searchResults,
    getResultById,
    getResultsByStudent,
    getResultsByCourse,
    getResultsBySession,
    getResultsByDepartment,
    getResultsByStatus
  };
}

// Specialized hooks for common use cases
export function useResultsByStudent(
  supabase: any,
  studentId: string,
  options?: Omit<UseResultsOptions, 'studentId'>
) {
  return useResults(supabase, { ...options, studentId });
}

export function useResultsByCourse(
  supabase: any,
  courseId: string,
  options?: Omit<UseResultsOptions, 'courseId'>
) {
  return useResults(supabase, { ...options, courseId });
}

export function useResultsBySession(
  supabase: any,
  sessionId: string,
  options?: Omit<UseResultsOptions, 'sessionId'>
) {
  return useResults(supabase, { ...options, sessionId });
}

export function useResultsByDepartment(
  supabase: any,
  departmentId: string,
  options?: Omit<UseResultsOptions, 'departmentId'>
) {
  return useResults(supabase, { ...options, departmentId });
}

export function useResultById(
  supabase: any,
  resultId: string,
  options?: Omit<UseResultsOptions, 'enabled'>
) {
  const queryConfig = createQueryConfig<ResultInput>(
    'results',
    ['results', resultId],
    {
      filters: { id: resultId },
      enabled: !!resultId
    }
  );

  const query = useSupabaseQuery(supabase, { config: queryConfig });

  return {
    result: query.data?.[0],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
} 