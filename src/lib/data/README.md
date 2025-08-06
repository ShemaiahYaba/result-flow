# Supabase + React Query Data Layer

A clean, modular data layer for ResultFlow that combines React Query with Supabase's real-time capabilities.

## Quick Start

```tsx
import { useStudents } from '@/hooks';

function StudentList() {
  const { students, isLoading, createStudent } = useStudents(supabase, {
    departmentId: 'dept-123',
    enableRealtime: true
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {students?.map(student => (
        <div key={student.id}>{student.full_name}</div>
      ))}
    </div>
  );
}
```

## Available Hooks

### Generic Hooks
- `useSupabaseQuery` - Generic query hook
- `useSupabaseMutation` - Generic mutation hook  
- `useRealtimeSync` - Real-time synchronization

### Table-Specific Hooks
- `useStudents` - Complete students management
- `useCourses` - Complete courses management
- `useResults` - Complete results management

## Features

✅ **Type-safe** - Full TypeScript support with Zod validation  
✅ **Real-time** - Automatic updates when data changes  
✅ **Error handling** - Integrated with global error handler  
✅ **Caching** - React Query caching and invalidation  
✅ **Loading states** - Built-in loading and error states  
✅ **CRUD operations** - Create, read, update, delete  
✅ **Filtering** - Department, session, level filters  
✅ **Search** - Built-in search functionality  
✅ **Bulk operations** - Bulk create/update/delete  

## Example Usage

```tsx
// Query with filters
const { students } = useStudents(supabase, {
  departmentId: 'dept-123',
  sessionId: 'session-456',
  limit: 50
});

// Create new student
const { createStudent } = useStudents(supabase);
await createStudent.mutateAsync({
  matric_number: 'F/HD/21/1234567',
  full_name: 'John Doe',
  email: 'john@example.com'
});

// Real-time updates
const { students } = useStudents(supabase, {
  enableRealtime: true // Automatically updates
});
```

## Integration

The data layer integrates with:
- Global Context for state management
- Error Handler for error handling
- Validation schemas for type safety
- UI components for consistent design

See `src/components/StudentList.tsx` for a complete example. 