import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { SupabaseClient, PostgrestFilterBuilder } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { useErrorHandler, ErrorType } from '../../utils/ErrorHandler';

export interface SupabaseQueryConfig<TData = any> {
  queryKey: string[];
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  retryDelay?: number;
}

export interface UseSupabaseQueryOptions<TData = any> extends Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'> {
  config: SupabaseQueryConfig<TData>;
}

export function useSupabaseQuery<TData = any>(
  supabase: SupabaseClient,
  options: UseSupabaseQueryOptions<TData>
): UseQueryResult<TData, Error> {
  const { addNotification } = useGlobalContext();
  const { handleError, createError } = useErrorHandler();

  const buildQuery = useCallback(() => {
    let query: PostgrestFilterBuilder<any, any, any> = supabase
      .from(options.config.table)
      .select(options.config.select || '*');

    // Apply filters
    if (options.config.filters) {
      Object.entries(options.config.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value.operator) {
            // Handle custom operators like { operator: 'in', value: [1,2,3] }
            query = query.filter(key, value.operator, value.value);
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }

    // Apply ordering
    if (options.config.orderBy) {
      const { column, ascending = true } = options.config.orderBy;
      query = query.order(column, { ascending });
    }

    // Apply pagination
    if (options.config.limit) {
      query = query.limit(options.config.limit);
    }

    if (options.config.offset) {
      query = query.range(options.config.offset, (options.config.offset + (options.config.limit || 10)) - 1);
    }

    return query;
  }, [supabase, options.config]);

  const queryFn = useCallback(async (): Promise<TData> => {
    try {
      const query = buildQuery();
      const { data, error } = await query;

      if (error) {
        const appError = handleError(error, {
          context: 'useSupabaseQuery',
          table: options.config.table,
          queryKey: options.config.queryKey
        });

        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Query Error',
          message: appError.message,
          duration: 5000
        });

        throw new Error(appError.message);
      }

      return data as TData;
    } catch (error) {
      const appError = handleError(error, {
        context: 'useSupabaseQuery',
        table: options.config.table,
        queryKey: options.config.queryKey
      });

      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Query Failed',
        message: appError.message,
        duration: 5000
      });

      throw error;
    }
  }, [buildQuery, handleError, addNotification, options.config]);

  return useQuery({
    queryKey: options.config.queryKey,
    queryFn,
    enabled: options.config.enabled !== false,
    staleTime: options.config.staleTime || 5 * 60 * 1000, // 5 minutes
    cacheTime: options.config.cacheTime || 10 * 60 * 1000, // 10 minutes
    retry: options.config.retry ?? 3,
    retryDelay: options.config.retryDelay || 1000,
    ...options
  });
}

// Helper function for common query patterns
export function createQueryConfig<TData = any>(
  table: string,
  queryKey: string[],
  options?: Partial<SupabaseQueryConfig<TData>>
): SupabaseQueryConfig<TData> {
  return {
    queryKey,
    table,
    ...options
  };
} 