import React from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * LoadingState
 * Centralized loading UI for spinners, skeletons, and custom messages.
 * - Respects dark theme and global context.
 * - Skeletons use existing Skeleton component for visual consistency.
 * - Spinner is implemented inline for lightweight usage.
 * - Message is optional and customizable.
 */
export interface LoadingStateProps {
  mode?: "spinner" | "skeleton";
  message?: string;
  className?: string;
  skeletonRows?: number;
  skeletonHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  mode = "spinner",
  message = "Loading...",
  className = "",
  skeletonRows = 3,
  skeletonHeight = "h-6",
}) => {
  // Spinner fallback: simple SVG, styled for dark mode
  const Spinner = () => (
    <svg
      className="animate-spin h-8 w-8 text-primary mx-auto mb-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[120px] text-center text-muted-foreground py-8",
        className
      )}
    >
      {mode === "spinner" ? (
        <>
          <Spinner />
          {message && <div className="text-base font-medium mt-2">{message}</div>}
        </>
      ) : (
        <div className="w-full space-y-2">
          {[...Array(skeletonRows)].map((_, idx) => (
            <Skeleton key={idx} className={cn("w-full", skeletonHeight)} />
          ))}
          {message && <div className="text-base font-medium mt-4">{message}</div>}
        </div>
      )}
    </div>
  );
};
