# In-Memory JWT Authentication Implementation

## Overview

This implementation provides JWT-based authentication using **in-memory storage** instead of cookies or localStorage. The JWT access tokens are stored in the GlobalContext and used throughout the application for API authentication.

## Key Features

✅ **In-Memory Token Storage** - JWT tokens stored in React context, not cookies/localStorage  
✅ **Automatic Token Refresh** - Tokens refreshed automatically before expiration  
✅ **Unified Role-Based Access** - Admin, HOD, and Student roles follow the same patterns  
✅ **Supabase SDK Only** - No external JWT libraries required  
✅ **Real-time Auth State** - Context provides live authentication status  

## Architecture

### 1. GlobalContext (`src/contexts/GlobalContext.tsx`)
- Stores `accessToken`, `refreshToken`, and `tokenExpiresAt` in memory
- Provides `signInWithJWT()`, `signOut()`, `refreshAccessToken()` functions
- Auto-refreshes tokens 1 minute before expiration
- Guarantees `loading` and `role` properties (never undefined)

### 2. Auth Middleware (`src/lib/api/authMiddleware.ts`)
- Accepts JWT tokens from Authorization header OR context
- Verifies tokens using `supabase.auth.getUser(token)`
- Fetches fresh user roles from `profiles` table
- Integrates with existing error handling

### 3. Admin Layout (`src/app/admin/layout.tsx`)
- Uses in-memory JWT tokens instead of session cookies
- Checks `getAccessToken()` and `isTokenExpired()` from context
- Redirects unauthenticated users to `/login`
- Redirects non-admin users to `/403`

## Usage Examples

### Login Component
```tsx
import { useGlobalContext } from '@/contexts/GlobalContext';

const { signInWithJWT, state } = useGlobalContext();

const handleLogin = async () => {
  await signInWithJWT(email, password);
  // JWT tokens now stored in memory
};
```

### Protected API Calls
```tsx
import { useAuthenticatedApi } from '@/utils/auth/clientHelpers';

const { callAdminApi } = useAuthenticatedApi();

// Automatically uses in-memory JWT token
const users = await callAdminApi('/users');
```

### API Route Protection
```tsx
import { withAuth } from '@/lib/api/authMiddleware';

export const GET = withAuth(
  async (req) => {
    // req.user and req.role available
    return Response.json({ data: 'success' });
  },
  { requiredRole: 'admin' }
);
```

## Authentication Flow

1. **Login**: User enters credentials → `signInWithJWT()` → JWT stored in context
2. **API Calls**: `useAuthenticatedApi()` → Gets token from context → Adds to Authorization header
3. **Route Protection**: Layout checks `getAccessToken()` → Redirects if invalid
4. **Auto-Refresh**: Context monitors expiration → Refreshes before expiry
5. **Logout**: `signOut()` → Clears tokens from memory → Redirects to login

## Role-Based Access Control

Following unified patterns (no special-case handling for admin):

- **Admin**: Access to `/admin/*` routes and admin APIs
- **HOD**: Access to `/hod/*` routes and HOD APIs  
- **Student**: Access to `/student/*` routes and student APIs

All roles use the same authentication mechanisms and context.

## Security Benefits

- **No Persistent Storage**: Tokens cleared on browser close/refresh
- **Automatic Expiration**: Tokens auto-refresh, reducing exposure time
- **Fresh Role Checks**: User roles fetched from database on each API request
- **Supabase Verification**: All tokens verified through Supabase SDK

## Files Modified/Created

**Core Authentication:**
- `src/contexts/GlobalContext.tsx` - In-memory token storage
- `src/lib/api/authMiddleware.ts` - JWT verification middleware
- `src/utils/auth/clientHelpers.ts` - Client-side auth utilities

**UI Components:**
- `src/components/auth/LoginForm.tsx` - JWT-based login form
- `src/app/login/page.tsx` - Login page with auto-redirect
- `src/app/admin/layout.tsx` - In-memory JWT protection

**API Routes:**
- `src/app/api/admin/users/route.ts` - Example protected admin endpoint
- `src/app/api/admin/departments/route.ts` - Example CRUD operations

## Migration from Cookie-Based Auth

Your existing `routeFactory.ts` continues to work unchanged. The new system adds JWT support alongside cookie-based auth. To migrate:

1. Replace `makeRoute` with `withAuth` for JWT-protected routes
2. Use `useAuthenticatedApi()` hook for client-side API calls
3. Update layouts to use `getAccessToken()` instead of session cookies

## Testing

Visit `/login` to test the implementation:
1. Enter valid credentials
2. JWT tokens stored in memory (check React DevTools)
3. Navigate to `/admin` (redirects if not admin)
4. API calls automatically include JWT headers
5. Tokens refresh automatically before expiration

The implementation is now complete and ready for production use! 🚀
