# UI State System (`ui-states/`)

A plug-and-play, centralized system for displaying **Loading**, **Empty**, and **Error** states in your app, designed for seamless integration with your existing architecture (global context, error handler, notification system, React Query, Tailwind, etc).

## Purpose
- **Consistency:** Unified UX for all data-fetching states (loading, empty, error) across all pages and components.
- **Reusability:** No more boilerplate—use the same components everywhere.
- **Integration:** Plugs directly into your advanced error handler and notification system.
- **Styling:** Follows your dark theme, Tailwind, and component conventions.

## Components & Hook
- `LoadingState.tsx`: Spinner, skeleton, and custom loading message.
- `EmptyState.tsx`: Customizable message and optional action button.
- `ErrorState.tsx`: Parses error using your error handler, supports retry, triggers notification system.
- `useUIStates.ts`: Utility hook to decide which state to show (loading, error, empty, success).
- `UIStateWrapper.tsx`: Simple wrapper to handle all states and render children on success.

## How to Import & Use
Import what you need from `src/components/ui-states/`:

```tsx
import { UIStateWrapper } from "@/components/ui-states/UIStateWrapper";
// Or import individual states/hooks if needed
```

## Example Usage (Data Table/List)
```tsx
import { UIStateWrapper } from "@/components/ui-states/UIStateWrapper";
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, isError, error, refetch } = useQuery(...);

return (
  <UIStateWrapper
    isLoading={isLoading}
    isError={isError}
    error={error}
    isEmpty={!data?.length}
    retry={refetch}
  >
    <StudentTable data={data} />
  </UIStateWrapper>
);
```

## Component Props
### `UIStateWrapper`
- `isLoading`, `isError`, `error`, `isEmpty`, `isSuccess`: Query state flags.
- `retry`: Retry callback for error state.
- `loadingMode`: "spinner" | "skeleton" (default: spinner)
- `loadingMessage`: Custom loading message.
- `emptyMessage`, `emptyActionLabel`, `onEmptyAction`: Empty state customization.
- `errorNotify`: Whether to trigger notification system (default: true).

### `LoadingState`
- `mode`: "spinner" | "skeleton"
- `message`: Custom message
- `skeletonRows`, `skeletonHeight`: Skeleton customization

### `EmptyState`
- `message`: Message to display
- `actionLabel`, `onAction`: Optional action button

### `ErrorState`
- `error`: The error object (raw)
- `onRetry`, `showRetry`: Retry support
- `notify`: Whether to trigger notification system

### `useUIStates`
- Utility hook for custom render logic if you don't want to use the wrapper.

## Known Caveats & Troubleshooting
- **Error handler integration:** `ErrorState` expects your error handler (`useErrorHandler`) to be available and working. If you customize error parsing, update `ErrorState` accordingly.
- **Notification spam:** By default, `ErrorState` triggers a notification on mount. If you use it in a list or loop, consider disabling `notify`.
- **Empty state logic:** You are responsible for passing a correct `isEmpty` flag (e.g., `!data?.length`).
- **Styling:** All components use Tailwind and inherit dark mode. For custom themes, extend the classes as needed.

## Advanced Usage
You can use the individual states and the hook for more granular control:

```tsx
import { useUIStates } from "@/components/ui-states/useUIStates";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui-states";

const { showLoading, showError, showEmpty } = useUIStates({
  isLoading, isError, error, isEmpty, isSuccess
});

if (showLoading) return <LoadingState mode="skeleton" />;
if (showError) return <ErrorState error={error} onRetry={refetch} />;
if (showEmpty) return <EmptyState message="Nothing found!" />;
return <StudentTable data={data} />;
```

## File List
- `LoadingState.tsx`
- `EmptyState.tsx`
- `ErrorState.tsx`
- `useUIStates.ts`
- `UIStateWrapper.tsx`
- `README.md`

---
**Questions?** See inline comments in each file for integration details and logic explanations.
