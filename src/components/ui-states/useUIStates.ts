import { useMemo } from "react";
import { useErrorHandler } from "@/utils/ErrorHandler";

/**
 * useUIStates
 * Utility hook to determine which UI state to show based on query status.
 * - Returns an object with { showLoading, showError, showEmpty, showSuccess }
 * - Accepts loading, error, empty, and success flags/data.
 * - Integrates with error handler for error parsing.
 */
export interface UseUIStatesParams {
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
  isEmpty?: boolean;
  isSuccess?: boolean;
}

export function useUIStates({
  isLoading,
  isError,
  error,
  isEmpty,
  isSuccess,
}: UseUIStatesParams) {
  const { handleError } = useErrorHandler();

  // Parse error using error handler (if present)
  const parsedError = isError && error ? handleError(error) : null;

  // Decide which state to show
  const result = useMemo(() => {
    if (isLoading) return { showLoading: true };
    if (isError && parsedError) return { showError: true, error: parsedError };
    if (isEmpty) return { showEmpty: true };
    if (isSuccess) return { showSuccess: true };
    return { showSuccess: true };
  }, [isLoading, isError, isEmpty, isSuccess, parsedError]);

  return result;
}
