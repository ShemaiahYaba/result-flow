import { useCallback, useMemo } from 'react';
import { useSupabaseQuery, createQueryConfig } from '@/lib/data/useSupabaseQuery';
import { useSupabaseMutation, createInsertConfig, createUpdateConfig, createDeleteConfig } from '@/lib/data/useSupabaseMutation';
import { useRealtimeSync, createTableRealtimeConfigs } from '@/lib/data/useRealtimeSync';
import { useGlobalContext } from '@/contexts/GlobalContext';
import { 
  CourseInput, 
  CreateCourseInput, 
  UpdateCourseInput, 
  CourseSearchInput,
  BulkCourseInput 
} from '@/lib/validation/courses.schema';
import { validateData } from '@/lib/validation';

export interface UseCoursesOptions {
  departmentId?: string;
  sessionId?: string;
  level?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
  enableRealtime?: boolean;
}

export interface UseCoursesReturn {
  // Query results
  courses: CourseInput[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Mutations
  createCourse: ReturnType<typeof useSupabaseMutation<CourseInput, CreateCourseInput>>;
  updateCourse: ReturnType<typeof useSupabaseMutation<CourseInput, UpdateCourseInput>>;
  deleteCourse: ReturnType<typeof useSupabaseMutation<CourseInput, { id: string }>>;
  bulkCreateCourses: ReturnType<typeof useSupabaseMutation<CourseInput[], BulkCourseInput>>;
  
  // Utilities
  refetch: () => void;
  searchCourses: (searchParams: CourseSearchInput) => void;
  getCourseById: (id: string) => CourseInput | undefined;
  getCoursesByDepartment: (departmentId: string) => CourseInput[];
  getCoursesBySession: (sessionId: string) => CourseInput[];
  getCoursesByLevel: (level: string) => CourseInput[];
}

export function useCourses(
  supabase: any,
  options: UseCoursesOptions = {}
): UseCoursesReturn {
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
  const queryConfig = useMemo(() => createQueryConfig<CourseInput[]>(
    'courses',
    ['courses', JSON.stringify(filters), String(options.limit || 50), String(options.offset || 0)],
    {
      select: `
        *,
        departments!courses_department_id_fkey (
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
    createTableRealtimeConfigs('courses', ['courses']),
    []
  );

  useRealtimeSync(supabase, {
    configs: realtimeConfigs,
    enabled: options.enableRealtime !== false && !!user
  });

  // Mutations
  const createCourse = useSupabaseMutation(supabase, {
    config: createInsertConfig<CourseInput, CreateCourseInput>(
      'courses',
      [['courses']],
      {
        onSuccess: (data, variables) => {
          console.log('Course created:', data);
        }
      }
    )
  });

  const updateCourse = useSupabaseMutation(supabase, {
    config: createUpdateConfig<CourseInput, UpdateCourseInput>(
      'courses',
      [['courses']],
      {
        onSuccess: (data, variables) => {
          console.log('Course updated:', data);
        }
      }
    )
  });

  const deleteCourse = useSupabaseMutation(supabase, {
    config: createDeleteConfig<CourseInput, { id: string }>(
      'courses',
      [['courses']],
      {
        onSuccess: (data, variables) => {
          console.log('Course deleted:', data);
        }
      }
    )
  });

  const bulkCreateCourses = useSupabaseMutation(supabase, {
    config: createInsertConfig<CourseInput[], BulkCourseInput>(
      'courses',
      [['courses']],
      {
        onSuccess: (data, variables) => {
          console.log('Courses bulk created:', data);
        }
      }
    )
  });

  // Utility functions
  const searchCourses = useCallback((searchParams: any) => {
    // This would typically trigger a new query with search filters
    // For now, we'll just log the search parameters
    console.log('Searching courses with:', searchParams);
  }, []);

  const getCourseById = useCallback((id: string): CourseInput | undefined => {
    return query.data?.find(course => course.id === id);
  }, [query.data]);

  const getCoursesByDepartment = useCallback((departmentId: string): CourseInput[] => {
    return query.data?.filter(course => course.department_id === departmentId) || [];
  }, [query.data]);

  const getCoursesBySession = useCallback((sessionId: string): CourseInput[] => {
    // Note: courses table doesn't have session_id, this function is not applicable
    return query.data || [];
  }, [query.data]);

  const getCoursesByLevel = useCallback((level: string): CourseInput[] => {
    return query.data?.filter(course => course.level === level) || [];
  }, [query.data]);

  return {
    // Query results
    courses: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Mutations
    createCourse,
    updateCourse,
    deleteCourse,
    bulkCreateCourses,
    
    // Utilities
    refetch: query.refetch,
    searchCourses,
    getCourseById,
    getCoursesByDepartment,
    getCoursesBySession,
    getCoursesByLevel
  };
}

// Specialized hooks for common use cases
export function useCoursesByDepartment(
  supabase: any,
  departmentId: string,
  options?: Omit<UseCoursesOptions, 'departmentId'>
) {
  return useCourses(supabase, { ...options, departmentId });
}

export function useCoursesBySession(
  supabase: any,
  sessionId: string,
  options?: Omit<UseCoursesOptions, 'sessionId'>
) {
  return useCourses(supabase, { ...options, sessionId });
}

export function useCoursesByLevel(
  supabase: any,
  level: string,
  options?: Omit<UseCoursesOptions, 'level'>
) {
  return useCourses(supabase, { ...options, level });
}

export function useCourseById(
  supabase: any,
  courseId: string,
  options?: Omit<UseCoursesOptions, 'enabled'>
) {
  const queryConfig = createQueryConfig<CourseInput>(
    'courses',
    ['courses', courseId],
    {
      filters: { id: courseId },
      enabled: !!courseId
    }
  );

  const query = useSupabaseQuery(supabase, { config: queryConfig });

  return {
    course: Array.isArray(query.data) ? query.data[0] : undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
} 