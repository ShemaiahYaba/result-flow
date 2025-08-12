# Comprehensive Refactor Prompt: Global Context + Error Provider + Notification System for Supabase Auth

## Task Overview
You are tasked with refactoring a Vite-based application to implement a production-grade global context management system, comprehensive error handling, and notification system specifically designed for Supabase authentication. The system should be modular, type-safe, and follow React best practices.

## Requirements

### 1. **Global Context System**
Create a centralized state management system using React Context API that handles:

**Authentication State:**
- User session management (login/logout/refresh)
- User profile data
- Authentication status (loading, authenticated, unauthenticated)
- Role-based access control (admin, user, etc.)
- Session persistence across page reloads

**Application State:**
- Theme management (light/dark mode)
- Language/localization preferences
- Sidebar/collapsible state
- Global loading states
- User preferences

**Data State:**
- Cached data management
- Real-time subscription states
- Optimistic updates
- Data synchronization status

### 2. **Error Provider System**
Implement a comprehensive error handling system that includes:

**Error Types:**
- Authentication errors (invalid credentials, expired tokens, etc.)
- Network errors (timeout, connection issues)
- Validation errors (form validation, data validation)
- Permission errors (unauthorized access)
- Supabase-specific errors (PostgrestError, AuthError)
- Custom business logic errors

**Error Features:**
- Error categorization and severity levels
- Automatic error logging and reporting
- Retry mechanisms with exponential backoff
- User-friendly error messages
- Error recovery suggestions
- Error boundary integration

### 3. **Notification System**
Build a notification system that provides:

**Notification Types:**
- Success notifications (login success, data saved, etc.)
- Error notifications (validation errors, network errors)
- Warning notifications (session expiring, unsaved changes)
- Info notifications (system updates, tips)

**Notification Features:**
- Auto-dismiss with configurable duration
- Manual dismiss functionality
- Toast-style positioning (top-right, bottom-right, etc.)
- Animation and transition effects
- Queue management for multiple notifications
- Persistent notifications for critical messages

## Technical Implementation

### File Structure
```
src/
├── contexts/
│   ├── GlobalContext.tsx          # Main global context
│   ├── AuthContext.tsx            # Authentication context
│   └── ErrorContext.tsx           # Error handling context
├── providers/
│   ├── GlobalProvider.tsx         # Main provider wrapper
│   ├── SupabaseProvider.tsx       # Supabase client provider
│   └── QueryProvider.tsx          # React Query provider
├── hooks/
│   ├── useAuth.ts                 # Authentication hooks
│   ├── useGlobalContext.ts        # Global context hooks
│   ├── useErrorHandler.ts         # Error handling hooks
│   └── useNotifications.ts        # Notification hooks
├── utils/
│   ├── supabase.ts                # Supabase client configuration
│   ├── errorHandler.ts            # Error handling utilities
│   ├── authUtils.ts               # Authentication utilities
│   └── notificationUtils.ts       # Notification utilities
├── components/
│   ├── providers/
│   │   ├── AppProviders.tsx       # All providers wrapper
│   │   └── ErrorBoundary.tsx      # Error boundary component
│   ├── ui/
│   │   ├── NotificationToast.tsx  # Individual notification component
│   │   ├── NotificationContainer.tsx # Notification container
│   │   └── LoadingSpinner.tsx     # Loading component
│   └── auth/
│       ├── LoginForm.tsx          # Login form component
│       ├── ProtectedRoute.tsx     # Route protection component
│       └── AuthGuard.tsx          # Authentication guard
└── types/
    ├── auth.ts                    # Authentication types
    ├── errors.ts                  # Error types
    ├── notifications.ts           # Notification types
    └── global.ts                  # Global state types
```

### Core Components Implementation

#### 1. Global Context (`src/contexts/GlobalContext.tsx`)
```typescript
interface GlobalState {
  auth: {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: AuthError | null;
  };
  ui: {
    theme: 'light' | 'dark';
    language: string;
    sidebarOpen: boolean;
    notifications: Notification[];
  };
  data: {
    cache: Record<string, any>;
    subscriptions: Record<string, RealtimeChannel>;
    optimisticUpdates: Record<string, any>;
  };
}

interface GlobalContextType {
  state: GlobalState;
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  toggleSidebar: () => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Data actions
  setCache: (key: string, value: any) => void;
  clearCache: (key?: string) => void;
  
  // Utility functions
  isAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
}
```

#### 2. Error Handler (`src/utils/errorHandler.ts`)
```typescript
enum ErrorType {
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  SUPABASE = 'supabase',
  BUSINESS = 'business',
  UNKNOWN = 'unknown'
}

enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: Date;
  context?: Record<string, any>;
  retryable: boolean;
  retryCount: number;
}

class ErrorHandler {
  static getInstance(): ErrorHandler;
  createError(type: ErrorType, message: string, context?: Record<string, any>): AppError;
  parseSupabaseError(error: PostgrestError | AuthError): AppError;
  parseNetworkError(error: Error): AppError;
  handleError(error: any, context?: Record<string, any>): AppError;
  retryOperation<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>;
  logError(error: AppError): void;
}
```

#### 3. Notification System (`src/components/ui/NotificationContainer.tsx`)
```typescript
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: Date;
}

interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  autoDismiss?: boolean;
  defaultDuration?: number;
}
```

### Integration with Supabase

#### 1. Supabase Client Configuration (`src/utils/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state changes
  console.log('Auth state changed:', event, session);
});
```

#### 2. Authentication Hooks (`src/hooks/useAuth.ts`)
```typescript
export function useAuth() {
  const { state, dispatch } = useGlobalContext();
  
  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      dispatch({ type: 'SET_SESSION', payload: data.session });
      dispatch({ type: 'SET_USER', payload: data.user });
      
    } catch (error) {
      const appError = ErrorHandler.getInstance().parseSupabaseError(error);
      dispatch({ type: 'SET_AUTH_ERROR', payload: appError });
      throw appError;
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    }
  }, [dispatch]);
  
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'CLEAR_AUTH' });
    } catch (error) {
      const appError = ErrorHandler.getInstance().parseSupabaseError(error);
      dispatch({ type: 'SET_AUTH_ERROR', payload: appError });
      throw appError;
    }
  }, [dispatch]);
  
  return {
    user: state.auth.user,
    session: state.auth.session,
    isLoading: state.auth.isLoading,
    isAuthenticated: state.auth.isAuthenticated,
    error: state.auth.error,
    login,
    logout,
  };
}
```

### Provider Setup (`src/components/providers/AppProviders.tsx`)
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalProvider } from '../../contexts/GlobalContext';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { NotificationContainer } from '../ui/NotificationContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Custom retry logic based on error type
        return failureCount < 3 && error.type !== ErrorType.PERMISSION;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GlobalProvider>
          {children}
          <NotificationContainer 
            position="top-right"
            maxNotifications={5}
            autoDismiss={true}
            defaultDuration={5000}
          />
        </GlobalProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

### Main App Integration (`src/main.tsx`)
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './components/providers/AppProviders';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
```

### Usage Examples

#### 1. Authentication in Components
```typescript
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const { addNotification } = useNotifications();
  
  const handleSubmit = async (formData: FormData) => {
    try {
      await login(formData.get('email') as string, formData.get('password') as string);
      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back!',
      });
    } catch (error) {
      // Error is automatically handled by the error handler
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.userMessage,
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### 2. Protected Routes
```typescript
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
}
```

#### 3. Error Handling in API Calls
```typescript
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { useErrorHandler } from '../hooks/useErrorHandler';

export function useStudents() {
  const { handleError } = useErrorHandler();
  
  return useSupabaseQuery(
    supabase,
    {
      table: 'students',
      select: '*',
      onError: (error) => {
        const appError = handleError(error, { context: 'students-query' });
        // Error is automatically logged and can trigger notifications
      },
    }
  );
}
```

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Set up Supabase client configuration
- [ ] Create error handler utility
- [ ] Create notification system components
- [ ] Set up global context structure
- [ ] Create provider wrappers

### Phase 2: Authentication Integration
- [ ] Implement authentication context
- [ ] Create authentication hooks
- [ ] Set up auth state listeners
- [ ] Implement protected route components
- [ ] Add session persistence

### Phase 3: Error Handling
- [ ] Implement error boundary
- [ ] Create error categorization
- [ ] Add retry mechanisms
- [ ] Set up error logging
- [ ] Create user-friendly error messages

### Phase 4: Notification System
- [ ] Create notification components
- [ ] Implement notification queue
- [ ] Add animation and transitions
- [ ] Create notification hooks
- [ ] Add persistent notifications

### Phase 5: Integration & Testing
- [ ] Integrate all providers
- [ ] Test authentication flow
- [ ] Test error handling
- [ ] Test notification system
- [ ] Add comprehensive error boundaries

## Best Practices

1. **Type Safety**: Use TypeScript throughout with strict typing
2. **Error Boundaries**: Wrap components to catch and handle errors gracefully
3. **Performance**: Use React.memo, useMemo, and useCallback appropriately
4. **Accessibility**: Ensure notifications and errors are accessible
5. **Testing**: Write unit tests for all utilities and integration tests for flows
6. **Documentation**: Document all APIs and provide usage examples
7. **Security**: Implement proper authentication checks and role-based access
8. **Monitoring**: Add error tracking and performance monitoring

## Expected Deliverables

1. Complete global context system with authentication
2. Comprehensive error handling with retry mechanisms
3. Notification system with multiple types and positions
4. Provider setup for easy integration
5. TypeScript types for all components
6. Usage examples and documentation
7. Error boundary implementation
8. Authentication guards and protected routes

This system should provide a solid foundation for a production-ready application with robust error handling, user-friendly notifications, and secure authentication using Supabase. 