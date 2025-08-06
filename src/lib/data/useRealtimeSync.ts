import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { useErrorHandler } from '../../utils/ErrorHandler';

export interface RealtimeConfig {
  table: string;
  queryKey: string[];
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  schema?: string;
}

export interface UseRealtimeSyncOptions {
  configs: RealtimeConfig[];
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function useRealtimeSync(
  supabase: SupabaseClient,
  options: UseRealtimeSyncOptions
) {
  const queryClient = useQueryClient();
  const { addNotification } = useGlobalContext();
  const { handleError } = useErrorHandler();
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    if (!options.enabled) {
      return;
    }

    const channels: RealtimeChannel[] = [];

    options.configs.forEach((config) => {
      try {
        const channel = supabase
          .channel(`${config.table}-changes`)
          .on(
            'postgres_changes',
            {
              event: config.event || '*',
              schema: config.schema || 'public',
              table: config.table,
              filter: config.filter
            },
            (payload) => {
              // Invalidate the corresponding query to trigger a refetch
              queryClient.invalidateQueries({ queryKey: config.queryKey });

              // Show notification for real-time updates
              addNotification({
                id: Date.now().toString(),
                type: 'info',
                title: 'Real-time Update',
                message: `${config.table} data has been updated`,
                duration: 2000
              });
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`Subscribed to ${config.table} changes`);
            } else if (status === 'CHANNEL_ERROR') {
              const error = new Error(`Failed to subscribe to ${config.table} changes`);
              const appError = handleError(error, {
                context: 'useRealtimeSync',
                table: config.table
              });

              addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Real-time Sync Error',
                message: appError.message,
                duration: 5000
              });

              if (options.onError) {
                options.onError(error);
              }
            }
          });

        channels.push(channel);
      } catch (error) {
        const appError = handleError(error, {
          context: 'useRealtimeSync',
          table: config.table
        });

        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Real-time Setup Error',
          message: appError.message,
          duration: 5000
        });

        if (options.onError) {
          options.onError(error as Error);
        }
      }
    });

    channelsRef.current = channels;

    // Cleanup function
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [supabase, options, queryClient, addNotification, handleError]);

  // Return cleanup function for manual unsubscribe
  const unsubscribe = () => {
    channelsRef.current.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  };

  return { unsubscribe };
}

// Helper function to create real-time configs
export function createRealtimeConfig(
  table: string,
  queryKey: string[],
  options?: Partial<RealtimeConfig>
): RealtimeConfig {
  return {
    table,
    queryKey,
    event: options?.event || '*',
    filter: options?.filter,
    schema: options?.schema || 'public'
  };
}

// Helper function for common real-time patterns
export function createTableRealtimeConfigs(
  table: string,
  baseQueryKey: string[]
): RealtimeConfig[] {
  return [
    createRealtimeConfig(table, baseQueryKey, { event: 'INSERT' }),
    createRealtimeConfig(table, baseQueryKey, { event: 'UPDATE' }),
    createRealtimeConfig(table, baseQueryKey, { event: 'DELETE' })
  ];
} 