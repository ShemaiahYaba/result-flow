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

### 2. Updated `src/app/admin/layout.tsx`
- **Purpose**: Client-side route protection for admin pages
- **Features**:
  - Uses `supabase.auth.getSession()` for session verification
  - Checks user role from `profiles` table
  - Redirects unauthorized users to `/` or `/403`
  - Listens to auth state changes with `onAuthStateChange`

### 3. `src/app/api/admin/users/route.ts`
- **Purpose**: Example admin API route using the auth middleware
- **Features**: Demonstrates proper JWT authentication integration

### 4. `src/app/403/page.tsx`
- **Purpose**: Forbidden access error page

### 5. `src/lib/api/enhancedRouteFactory.ts`
- **Purpose**: Alternative route factory with built-in JWT auth

## Usage Examples

### API Route with JWT Auth

```typescript
import { withAuth } from '@/lib/api/authMiddleware';

export const GET = withAuth(
  async (req) => {
    // req.user and req.role are available
    // Your handler logic here
    return Response.json({ data: 'success' });
  },
  { requiredRole: 'admin' } // Only admins can access
);
```

### Using Enhanced Route Factory

```typescript
import { makeEnhancedRoute } from '@/lib/api/enhancedRouteFactory';

export const GET = makeEnhancedRoute({
  method: 'GET',
  auth: { requiredRole: 'admin' },
  handle: async ({ user, role, input }) => {
    // Your logic here
    return { message: 'success' };
  }
});
```

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
