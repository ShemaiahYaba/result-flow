# ResultFlow API Architecture & Development Guide

## Table of Contents
1. [API Implementation Patterns](#api-implementation-patterns)
2. [Database Schema Conventions](#database-schema-conventions)
3. [Authentication & Authorization](#authentication--authorization)
4. [Frontend Integration Patterns](#frontend-integration-patterns)
5. [Security Guidelines](#security-guidelines)
6. [Error Handling](#error-handling)
7. [Testing & Validation](#testing--validation)

## API Implementation Patterns

### Route Factory Pattern
All API routes must use the `makeRoute` factory from `@/lib/api/routeFactory` for consistent authentication, validation, and response formatting.

```typescript
import { makeRoute } from '@/lib/api/routeFactory';
import { z } from 'zod';

const InputSchema = z.object({
  // Define input validation
});

const OutputSchema = z.object({
  // Define output structure
});

export const GET = makeRoute({
  method: 'GET',
  input: InputSchema,           // Optional: for query params/body validation
  output: OutputSchema,         // Required: response schema
  requiredRole: 'student',      // 'student' | 'hod' | 'admin' | 'any'
  handle: async ({ supabase, user, input }) => {
    // Implementation
    return responseData;
  }
});
```

### Response Format
All API responses follow the standard format:
```typescript
{
  ok: true,
  data: T  // Where T matches the OutputSchema
}
```

### Authentication Handling
The route factory handles both Bearer token and cookie-based authentication:
- **Bearer tokens**: Used by frontend `authenticatedFetch` calls
- **Cookies**: Used for server-side rendering

```typescript
// Frontend usage
const response = await authenticatedFetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

## Database Schema Conventions

### Primary Keys
- All tables use `uuid` primary keys with `gen_random_uuid()` default
- Foreign keys reference `id` fields of related tables

### Naming Conventions
- Tables: `snake_case` (e.g., `student_semester_enrollments`)
- Columns: `snake_case` (e.g., `first_name`, `created_at`)
- Foreign keys: `{table_name}_id` (e.g., `student_id`, `department_id`)

### Standard Columns
All tables should include:
```sql
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
```

### Key Relationships
```sql
-- University hierarchy
universities -> departments -> students/hods
universities -> admins (direct relationship)

-- Academic structure
universities -> academic_sessions -> academic_semesters
students -> student_semester_enrollments -> student_course_enrollments -> results_new

-- User authentication
users.user_entity_id -> students.id | hods.id | admins.id
```

### Supabase Relationship Queries
Use simplified relationship syntax without explicit foreign key names:

```typescript
// Correct
.select(`
  field1,
  field2,
  related_table (
    related_field1,
    related_field2
  )
`)

// Avoid explicit foreign key references unless necessary
.select(`
  field1,
  related_table!table_foreignkey_fkey (
    related_field
  )
`)
```

## Authentication & Authorization

### User Roles
- **student**: Access to own academic data
- **hod**: Department-level access and result management
- **admin**: University-level access and system administration

### Role-Based Access Control
```typescript
// Use user.user_entity_id to identify the specific student/hod/admin record
const entityId = user.user_entity_id;

// Filter queries by role
if (user.role === 'student') {
  query = query.eq('student_id', entityId);
} else if (user.role === 'hod') {
  // HODs can access their department's data
  query = query.eq('department_id', hodDepartmentId);
}
```

### Authentication Guards
Each role-based layout must include an authentication guard:

```typescript
// src/app/student/layout.tsx
function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user || user.role !== 'student') {
    redirect('/login');
  }
  
  return <>{children}</>;
}
```

## Frontend Integration Patterns

### Custom Hooks Pattern
Create dedicated hooks for API integration:

```typescript
// src/hooks/useStudentResults.ts
export const useStudentResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResults = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/student/results', {
        method: 'GET',
        // Add query params for filters
      });
      setData(response.data || response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchResults };
};
```

### Component Patterns
- **Loading States**: Always show loading indicators during API calls
- **Error Handling**: Provide retry mechanisms and clear error messages
- **Empty States**: Handle cases where no data is available
- **Filtering**: Implement client-side and server-side filtering as appropriate

### State Management
- Use React hooks for component-level state
- Use React Query for complex data fetching and caching
- Avoid prop drilling with React Context for global state

## Security Guidelines

### Read-Only Fields
Critical fields must never be editable by users:
- `staff_id`: Authentication identifier, tied to login credentials
- `matric_number`: Student identifier, used for academic records
- `id`: Primary keys should never be exposed or editable

### Input Validation
- Use Zod schemas for all API input validation
- Validate both client-side and server-side
- Sanitize user inputs to prevent injection attacks

### Data Access Control
- Always filter queries by user role and entity ID
- Never expose data from other universities/departments without proper authorization
- Use database-level constraints where possible

## Error Handling

### API Error Responses
```typescript
// Standard error format
{
  ok: false,
  error: {
    message: "Human-readable error message",
    code: "ERROR_CODE",
    details?: any
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User lacks required permissions
- `NOT_FOUND`: Requested resource doesn't exist
- `VALIDATION_ERROR`: Input validation failed
- `SESSION_EXPIRED`: Authentication session has expired

### Frontend Error Handling
```typescript
try {
  const response = await authenticatedFetch('/api/endpoint');
  // Handle success
} catch (error) {
  if (error.code === 'SESSION_EXPIRED') {
    // Redirect to login
    router.push('/login');
  } else {
    // Show error message to user
    setError(error.message);
  }
}
```

## Testing & Validation

### API Testing
- Test all authentication scenarios
- Validate input/output schemas
- Test role-based access control
- Test error conditions

### Database Testing
- Verify foreign key constraints
- Test cascade deletes where appropriate
- Validate unique constraints
- Test performance with realistic data volumes

### Frontend Testing
- Test loading states
- Test error conditions
- Test user interactions
- Test responsive design

## Development Workflow

### Adding New APIs
1. Define Zod schemas for input/output
2. Implement route using `makeRoute` pattern
3. Add proper role-based authorization
4. Create corresponding frontend hook
5. Update frontend components to use the hook
6. Add error handling and loading states
7. Test all scenarios

### Database Changes
1. Update schema documentation
2. Create migration scripts if needed
3. Update related API endpoints
4. Update frontend components
5. Test data integrity

### Security Checklist
- [ ] Input validation with Zod
- [ ] Role-based access control
- [ ] Read-only field protection
- [ ] Proper error handling
- [ ] Authentication guard implementation
- [ ] Data filtering by user context

## Best Practices

### Performance
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache static data where appropriate
- Optimize Supabase queries to minimize round trips

### Maintainability
- Follow consistent naming conventions
- Document complex business logic
- Use TypeScript for type safety
- Keep components small and focused
- Separate concerns (data fetching, UI logic, business logic)

### User Experience
- Provide immediate feedback for user actions
- Implement optimistic updates where safe
- Show meaningful loading states
- Provide clear error messages with actionable steps
- Ensure responsive design across devices

## Common Patterns

### Filtering and Pagination
```typescript
// API endpoint with filtering
const QuerySchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
  session_id: z.string().optional(),
  level: z.number().optional()
});

// Frontend hook with filtering
const useFilteredData = (filters) => {
  const [data, setData] = useState([]);
  
  const applyFilters = useCallback((newFilters) => {
    // Merge with existing filters
    const queryParams = new URLSearchParams(newFilters);
    fetchData(`/api/endpoint?${queryParams}`);
  }, []);
  
  return { data, applyFilters };
};
```

### Profile Management
```typescript
// Read-only display for sensitive fields
<div className="grid gap-4">
  <div>
    <label>Email (Read-only)</label>
    <Input value={user.email} disabled />
  </div>
  <div>
    <label>Staff ID (Read-only)</label>
    <Input value={user.staff_id} disabled />
  </div>
  {/* Only editable fields in form */}
</div>
```

This guide should be updated as the system evolves and new patterns emerge.
