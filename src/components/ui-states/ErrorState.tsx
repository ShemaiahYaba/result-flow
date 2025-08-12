import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useErrorHandler } from "@/utils/ErrorHandler";
import { useGlobalContext } from "@/contexts/GlobalContext";

/**
 * ErrorState
 * Centralized error UI that plugs into advanced error handler and notification system.
 * - Uses error handler to parse and display error.
 * - Supports retry callback.
 * - Triggers notification system if desired.
 * - Respects dark theme and styling conventions.
 */
export interface ErrorStateProps {
  error: any;
  onRetry?: () => void;
  showRetry?: boolean;
  notify?: boolean; // Whether to trigger notification system
  className?: string;
  icon?: React.ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  showRetry = true,
  notify = true,
  className = "",
  icon,
}) => {
  const { handleError, getErrorMessage, shouldRetry } = useErrorHandler();
  const { addNotification } = useGlobalContext();

  // Parse error using advanced error handler
  const appError = handleError(error);
  const errorMessage = getErrorMessage(appError);
  const canRetry = showRetry && (shouldRetry(appError) || !!onRetry);

  // Optionally trigger notification
  React.useEffect(() => {
    if (notify && errorMessage) {
      addNotification({
        type: "error",
        title: "Error",
        message: errorMessage,
        duration: 5000,
      });
    }
    // Only notify once per error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notify, errorMessage]);

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[120px] text-center py-8", className)}>
      {icon && <div className="mb-3 text-red-500">{icon}</div>}
      <div className="text-base font-semibold text-destructive mb-2">
        {errorMessage || "An unexpected error occurred."}
      </div>
      {canRetry && (
        <Button onClick={onRetry} variant="destructive" className="mt-2">
          Retry
        </Button>
      )}
    </div>
  );
};
