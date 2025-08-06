import React from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

/**
 * EmptyState
 * Centralized empty state UI for lists, tables, etc.
 * - Customizable message and optional action button.
 * - Respects dark theme and styling conventions.
 */
export interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No data found.",
  actionLabel,
  onAction,
  className = "",
  icon,
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[120px] text-center py-8", className)}>
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <div className="text-base font-medium text-muted-foreground mb-2">{message}</div>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="secondary" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
