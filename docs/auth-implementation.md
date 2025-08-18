# JWT Authentication Implementation

## Overview

This implementation provides JWT-based authentication for your Next.js + Supabase app with role-based access control.

## Files Created

### 1. `src/lib/api/authMiddleware.ts`
- **Purpose**: JWT token verification for API routes
- **Features**:
  - Extracts JWT from `Authorization: Bearer <token>` header
  - Uses `supabase.auth.getUser(token)` for verification
  - Fetches user role from `profiles` table
  - Integrates with your existing error handling system
  - Supports role-based authorization

### Entity Tables  
- **`students`**: Student profiles with `matric_number`, `email`, `department_id`
- **`hods`**: HOD profiles with `staff_id`, `email`, `department_id`
- **`admins`**: Admin profiles with `admin_id`, `email`, `university_id`

## Updated Authentication Flow

1. **Login Request**: User provides ID type (`matric_number`, `staff_id`, `admin_id`) and password
2. **ID Lookup**: `/api/lookup-email` queries appropriate entity table to get email and role
3. **Supabase Auth**: Authenticate with email/password via Supabase
4. **JWT Token**: Generate JWT with user info including `user_entity_id`
5. **Route Protection**: Validate JWT and resolve entity data on protected routes

## Key Components

### Updated Email Lookup API (`/api/lookup-email`)
- Accepts `matric_number`, `staff_id`, or `admin_id`
- Queries appropriate entity table (`students`, `hods`, `admins`)
- Returns associated email and role
- Handles role detection automatically

### Enhanced Route Factory (`routeFactory.ts`)
- Updated `getAuthenticatedUser()` to query `users` table
- Resolves `user_entity_id` to link authentication with business entities
- Maintains role-based permissions
- Supports Bearer tokens and cookies

### University-Scoped Access
- Admin operations scoped to their university
- HOD operations scoped to their department's university
- Student operations scoped to their department's university

## Security Improvements

- **Data Isolation**: University-specific data access
- **Entity Separation**: Authentication IDs separate from business logic
- **Role Resolution**: Dynamic role lookup via `users -> roles` relationship
- **Multi-tenant Support**: University-scoped operations

## Migration Changes

### Email Lookup API
```typescript
// OLD: Single profiles table
const { data } = await supabase
  .from('profiles')
  .select('email, role')
  .eq(idType, idValue);

// NEW: Entity-specific tables
if (idType === 'matric_number') {
  const { data } = await supabase
    .from('students')
    .select('email')
    .eq('matric_number', idValue);
  // role = 'student'
}
```

### Route Authentication
```typescript
// OLD: Direct profile lookup
const { data: user } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);

// NEW: Users table with entity resolution
const { data: userData } = await supabase
  .from('users')
  .select('user_entity_id, roles(role_name)')
  .eq('id', userId);
```

## Usage Example

```typescript
// Protected API route with new schema
export const GET = makeRoute({
  requiredRole: 'admin',
  handle: async ({ user, supabase }) => {
    // Get admin's university for scoped access
    const { data: adminData } = await supabase
      .from('admins')
      .select('university_id')
      .eq('id', user.user_entity_id);
    
    // Query university-scoped data
    return { universityId: adminData.university_id };
  }
});
```

## Benefits

- **Scalability**: Multi-university support with data isolation
- **Security**: Enhanced role-based access with university scoping
- **Maintainability**: Clear separation between auth and business logic
- **Flexibility**: Easy to add new roles and entities

### Client-Side API Calls

```typescript
// Get JWT token from Supabase session
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Make authenticated API call
const response = await fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Integration with Existing Code

Your existing `makeRoute` function in `routeFactory.ts` continues to work with cookie-based auth. The new middleware provides JWT-based auth for scenarios where you need Bearer token authentication.

## Role-Based Access Control

Following your memory preferences, all role checks follow a unified pattern:
- **Admin**: Access to everything
- **HOD**: Access to HOD and student resources
- **Student**: Access to student resources only

## Error Handling

The middleware integrates with your existing `ErrorHandler` class and returns consistent error responses that match your current API patterns.

## Security Notes

1. JWT tokens are verified using Supabase's `getUser()` method
2. User roles are fetched fresh from the database on each request
3. All errors are properly logged and handled
4. No external JWT libraries are used - only Supabase SDK
