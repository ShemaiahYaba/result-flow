import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { useErrorHandler, ErrorType } from '../../utils/ErrorHandler';

export type MutationType = 'insert' | 'update' | 'delete' | 'upsert';

export interface SupabaseMutationConfig<TData = any, TVariables = any> {
  table: string;
  mutationType: MutationType;
  queryKeysToInvalidate?: string[][];
  optimisticUpdate?: {
    queryKey: string[];
    updateFn: (oldData: any, newData: TVariables) => any;
  };
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export interface UseSupabaseMutationOptions<TData = any, TVariables = any> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  config: SupabaseMutationConfig<TData, TVariables>;
}

export function useSupabaseMutation<TData = any, TVariables = any>(
  supabase: SupabaseClient,
  options: UseSupabaseMutationOptions<TData, TVariables>
): UseMutationResult<TData, Error, TVariables> {
  const { addNotification } = useGlobalContext();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  const mutationFn = useCallback(async (variables: TVariables): Promise<TData> => {
    try {
      let result: any;

      switch (options.config.mutationType) {
        case 'insert':
          result = await supabase
            .from(options.config.table)
            .insert(variables as any)
            .select();
          break;

        case 'update':
          const { id, ...updateData } = variables as any;
          result = await supabase
            .from(options.config.table)
            .update(updateData)
            .eq('id', id)
            .select();
          break;

        case 'delete':
          const deleteId = (variables as any).id;
          result = await supabase
            .from(options.config.table)
            .delete()
            .eq('id', deleteId)
            .select();
          break;

        case 'upsert':
          result = await supabase
            .from(options.config.table)
            .upsert(variables as any, { onConflict: 'id' })
            .select();
          break;

        default:
          throw new Error(`Unknown mutation type: ${options.config.mutationType}`);
      }

      if (result.error) {
        const appError = handleError(result.error, {
          context: 'useSupabaseMutation',
          table: options.config.table,
          mutationType: options.config.mutationType
        });

        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Mutation Error',
          message: appError.message,
          duration: 5000
        });

        throw new Error(appError.message);
      }

      return result.data as TData;
    } catch (error) {
      const appError = handleError(error, {
        context: 'useSupabaseMutation',
        table: options.config.table,
        mutationType: options.config.mutationType
      });

      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Mutation Failed',
        message: appError.message,
        duration: 5000
      });

      throw error;
    }
  }, [supabase, options.config, handleError, addNotification]);

  const onSuccess = useCallback((data: TData, variables: TVariables) => {
    // Invalidate specified query keys
    if (options.config.queryKeysToInvalidate) {
      options.config.queryKeysToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }

    // Show success notification
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Success',
      message: `${options.config.mutationType.charAt(0).toUpperCase() + options.config.mutationType.slice(1)} completed successfully`,
      duration: 3000
    });

    // Call custom onSuccess if provided
    if (options.config.onSuccess) {
      options.config.onSuccess(data, variables);
    }
  }, [options.config, queryClient, addNotification]);

  const onError = useCallback((error: Error, variables: TVariables) => {
    // Call custom onError if provided
    if (options.config.onError) {
      options.config.onError(error, variables);
    }
  }, [options.config]);

  return useMutation({
    mutationFn,
    onSuccess,
    onError,
    ...options
  });
}

// Helper functions for common mutation patterns
export function createInsertConfig<TData = any, TVariables = any>(
  table: string,
  queryKeysToInvalidate?: string[][],
  options?: Partial<SupabaseMutationConfig<TData, TVariables>>
): SupabaseMutationConfig<TData, TVariables> {
  return {
    table,
    mutationType: 'insert',
    queryKeysToInvalidate,
    ...options
  };
}

export function createUpdateConfig<TData = any, TVariables = any>(
  table: string,
  queryKeysToInvalidate?: string[][],
  options?: Partial<SupabaseMutationConfig<TData, TVariables>>
): SupabaseMutationConfig<TData, TVariables> {
  return {
    table,
    mutationType: 'update',
    queryKeysToInvalidate,
    ...options
  };
}

export function createDeleteConfig<TData = any, TVariables = any>(
  table: string,
  queryKeysToInvalidate?: string[][],
  options?: Partial<SupabaseMutationConfig<TData, TVariables>>
): SupabaseMutationConfig<TData, TVariables> {
  return {
    table,
    mutationType: 'delete',
    queryKeysToInvalidate,
    ...options
  };
}

export function createUpsertConfig<TData = any, TVariables = any>(
  table: string,
  queryKeysToInvalidate?: string[][],
  options?: Partial<SupabaseMutationConfig<TData, TVariables>>
): SupabaseMutationConfig<TData, TVariables> {
  return {
    table,
    mutationType: 'upsert',
    queryKeysToInvalidate,
    ...options
  };
} 