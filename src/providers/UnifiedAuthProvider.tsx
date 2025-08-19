'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, type AuthState, type AuthUser } from '@/services/authService';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  accessToken: string | null;
  refreshTokenValue: string | null;
  tokenExpiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'admin' | 'hod' | 'student' | '';
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  hasRole: (role: 'admin' | 'hod' | 'student') => boolean;
  hasPermission: (permission: string) => boolean;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface UnifiedAuthProviderProps {
  children: ReactNode;
}

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    // Initialize auth service with callbacks
    authService.initialize({
      onAuthStateChange: (state) => {
        setAuthState(state);
      },
      onError: (error) => {
        console.error('Authentication Error:', error.message || 'An authentication error occurred');
      },
      onNotification: (notification) => {
        console.log('Auth Notification:', notification);
      },
    });
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    refreshTokenValue: authState.refreshToken,
    signIn: authService.signInWithJWT.bind(authService),
    signOut: authService.signOut.bind(authService),
    refreshToken: authService.refreshAccessToken.bind(authService),
    getAccessToken: authService.getAccessToken.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    hasPermission: authService.hasPermission.bind(authService),
    authenticatedFetch: authService.authenticatedFetch.bind(authService),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Clean useAuth hook - single source of truth for authentication
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UnifiedAuthProvider');
  }
  return context;
}

/**
 * HOC for protecting routes with role-based access
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: ('admin' | 'hod' | 'student')[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, role, signOut } = useAuth();

    // Show loading while checking authentication
    if (isLoading) {
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    // Check role-based access
    if (requiredRoles && requiredRoles.length > 0 && role && !requiredRoles.includes(role as 'admin' | 'hod' | 'student')) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Unauthorized</h2>
            <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Go to Home
              </button>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export default UnifiedAuthProvider;
