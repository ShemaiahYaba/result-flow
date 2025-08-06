import React from "react";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { useUIStates } from "./useUIStates";

/**
 * UIStateWrapper
 * Centralized wrapper to display Loading, Error, or Empty states based on query status.
 * - Accepts all relevant flags and passes props to the correct state component.
 * - Renders children only when in success state.
 * - Designed for use with React Query or similar data-fetching hooks.
 * - Inline comments explain logic and integration points.
 */
export interface UIStateWrapperProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
  isEmpty?: boolean;
  isSuccess?: boolean;
  retry?: () => void;
  loadingMode?: "spinner" | "skeleton";
  loadingMessage?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  errorNotify?: boolean;
  children: React.ReactNode;
}

export const UIStateWrapper: React.FC<UIStateWrapperProps> = ({
  isLoading,
  isError,
  error,
  isEmpty,
  isSuccess,
  retry,
  loadingMode = "spinner",
  loadingMessage,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  errorNotify = true,
  children,
}) => {
  // Decide which UI state to show using the utility hook
  const uiState = useUIStates({ isLoading, isError, error, isEmpty, isSuccess });

  if (uiState.showLoading) {
    return <LoadingState mode={loadingMode} message={loadingMessage} />;
  }
  if (uiState.showError) {
    return (
      <ErrorState
        error={error}
        onRetry={retry}
        showRetry={!!retry}
        notify={errorNotify}
      />
    );
  }
  if (uiState.showEmpty) {
    return (
      <EmptyState
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }
  // Success: render children
  return <>{children}</>;
};
