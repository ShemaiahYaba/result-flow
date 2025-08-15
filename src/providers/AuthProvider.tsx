'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthProvider, type AuthProviderAPI } from '../hooks/useAuthProvider';
import { type HydratedSessionData } from '../utils/auth/session-hydration';

interface AuthContextProps extends AuthProviderAPI {}

interface ExtendedAuthContextProps extends AuthProviderAPI {
  loading: boolean;
  role: 'student' | 'admin' | 'hod' | '';
}

const AuthContext = createContext<ExtendedAuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  ssrSessionData?: HydratedSessionData;
  initialRole?: string;
  initialUser?: any;
}

/**
 * Auth Provider Component
 * 
 * Usage in app/layout.tsx or pages/_app.tsx:
 * 
 * ```tsx
 * import { getServerSession, serializeSessionForClient } from '@/utils/auth/ssr-session';
 * 
 * export default async function RootLayout({ children }: { children: ReactNode }) {
 *   const serverSession = await getServerSession();
 *   const serializedSession = serializeSessionForClient(serverSession);
 * 
 *   return (
 *     <html>
 *       <body>
 *         <AuthProvider ssrSessionData={serializedSession}>
 *           {children}
 *         </AuthProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children, ssrSessionData, initialRole, initialUser }: AuthProviderProps) {
  // Use SSR-hydrated role/user if provided
  const authAPI = useAuthProvider(ssrSessionData, initialRole, initialUser);

  // Derive guaranteed role and loading
  let role: 'student' | 'admin' | 'hod' | '' = '';
  if (initialRole && ["student", "admin", "hod"].includes(initialRole)) {
    role = initialRole as 'student' | 'admin' | 'hod';
  } else if (authAPI?.profile && typeof authAPI.profile.role === 'string') {
    if (["student", "admin", "hod"].includes(authAPI.profile.role)) {
      role = authAPI.profile.role;
    }
  }
  // Prefer initialUser if provided
  const user = initialUser || authAPI.user;
  // Use isLoading or status
  const loading = authAPI.isLoading || authAPI.status === 'checking' || authAPI.status === 'loading';

  const extendedValue: ExtendedAuthContextProps = {
    ...authAPI,
    loading,
    role,
    user,
  };

  return (
    <AuthContext.Provider value={extendedValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * 
 * Usage in components:
 * ```tsx
 * const { user, isAuthenticated, login, logout, retryAuth } = useAuth();
 * ```
 */
export function useAuth(): ExtendedAuthContextProps {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * HOC for protecting routes
 * 
 * Usage:
 * ```tsx
 * export default withAuth(MyProtectedComponent, ['admin', 'hod']);
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: ('admin' | 'hod' | 'student')[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isSessionInitialized, hasRole, status } = useAuth();

    // Show loading while checking session
    if (!isSessionInitialized || status === 'checking') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access this page.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    // Check role-based access if roles are specified
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-gray-500">
                Required roles: {requiredRoles.join(', ')}
              </p>
            </div>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };
}

/**
 * Component for handling auth errors with retry
 */
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  const { error, retryAuth, status } = useAuth();

  if (error && status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <div className="space-x-4">
            <button 
              onClick={retryAuth}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthProvider;
