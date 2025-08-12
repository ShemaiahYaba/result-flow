// Data layer hooks
export * from './useStudents';
export * from './useCourses';
export * from './useResults';

// Re-export data layer utilities for convenience
export { 
  useSupabaseQuery, 
  createQueryConfig,
  type SupabaseQueryConfig,
  type UseSupabaseQueryOptions
} from '../lib/data/useSupabaseQuery';

export { 
  useSupabaseMutation,
  createInsertConfig,
  createUpdateConfig,
  createDeleteConfig,
  createUpsertConfig,
  type MutationType,
  type SupabaseMutationConfig,
  type UseSupabaseMutationOptions
} from '../lib/data/useSupabaseMutation';

export { 
  useRealtimeSync,
  createRealtimeConfig,
  createTableRealtimeConfigs,
  type RealtimeConfig,
  type UseRealtimeSyncOptions
} from '../lib/data/useRealtimeSync'; 