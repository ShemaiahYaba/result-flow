# 🔧 ResultFlow Integration Guide

## Overview

This guide explains how to integrate the Global Context and Error Handler into your ResultFlow application.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Global Context Usage](#global-context-usage)
3. [Error Handler Usage](#error-handler-usage)
4. [Component Examples](#component-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup

### 1. Root Layout Integration

Your `src/app/layout.tsx` should already be updated with:

```tsx
import { GlobalProvider } from "../contexts/GlobalContext";
import { ErrorBoundary } from "../utils/ErrorHandlerExample";
import NotificationSystem from "../components/ui/NotificationSystem";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <GlobalProvider>
            {children}
            <NotificationSystem />
          </GlobalProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 2. File Structure

Ensure you have these files in place:

```
src/
├── contexts/
│   └── GlobalContext.tsx          ✅ Global state management
├── utils/
│   ├── ErrorHandler.ts            ✅ Error handling utilities
│   └── ErrorHandlerExample.tsx    ✅ Error boundary component
├── components/ui/
│   └── NotificationSystem.tsx     ✅ Notification display
└── app/
    ├── layout.tsx                 ✅ Root layout with providers
    └── integration-demo/          ✅ Demo page
        └── page.tsx
```

---

## 🎯 Global Context Usage

### Basic Hook Usage

```tsx
import { useGlobalContext } from '../contexts/GlobalContext';

function MyComponent() {
  const { 
    state, 
    addNotification, 
    setTheme, 
    isAdmin,
    hasPermission 
  } = useGlobalContext();

  // Access state
  const { auth, data, ui } = state;
  
  // Use helpers
  const handleSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully.',
      duration: 3000,
    });
  };

  return (
    <div>
      <p>Current theme: {ui.theme}</p>
      <p>Is admin: {isAdmin() ? 'Yes' : 'No'}</p>
      <button onClick={handleSuccess}>Show Success</button>
    </div>
  );
}
```

### Authentication Helpers

```tsx
const { login, logout, updateProfile } = useGlobalContext();

// Login
const handleLogin = async () => {
  try {
    await login('user@example.com', 'password');
    addNotification({
      type: 'success',
      title: 'Welcome!',
      message: 'Successfully logged in.',
    });
  } catch (error) {
    // Error will be handled by error handler
  }
};

// Logout
const handleLogout = async () => {
  await logout();
  // User will be redirected to login
};
```

### Data Fetching Helpers

```tsx
const { 
  fetchDepartments, 
  fetchStudents, 
  fetchResults 
} = useGlobalContext();

// Fetch data on component mount
useEffect(() => {
  const loadData = async () => {
    try {
      await Promise.all([
        fetchDepartments(),
        fetchStudents(),
        fetchResults(),
      ]);
    } catch (error) {
      // Errors handled automatically
    }
  };

  loadData();
}, [fetchDepartments, fetchStudents, fetchResults]);
```

### Permission Checks

```tsx
const { isAdmin, isHOD, isStudent, hasPermission } = useGlobalContext();

// Role-based rendering
if (isAdmin()) {
  return <AdminDashboard />;
} else if (isHOD()) {
  return <HODDashboard />;
} else if (isStudent()) {
  return <StudentDashboard />;
}

// Permission-based actions
const canApproveResults = hasPermission('approve');
const canDeleteRecords = hasPermission('delete');
```

---

## ⚠️ Error Handler Usage

### Basic Error Handling

```tsx
import { useErrorHandler, ErrorType } from '../utils/ErrorHandler';

function MyComponent() {
  const { handleError, createError, getErrorMessage } = useErrorHandler();
  const { addNotification } = useGlobalContext();

  const handleApiCall = async () => {
    try {
      // Your API call
      const response = await fetch('/api/results');
      if (!response.ok) throw new Error('API call failed');
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Data loaded successfully.',
      });
    } catch (error) {
      const appError = handleError(error, {
        operation: 'fetch_results',
        component: 'MyComponent'
      });
      
      addNotification({
        type: 'error',
        title: 'Error',
        message: getErrorMessage(appError),
      });
    }
  };
}
```

### Custom Error Creation

```tsx
const { createError } = useErrorHandler();

const handleBusinessLogicError = () => {
  const customError = createError(
    ErrorType.BUSINESS_INVALID_OPERATION,
    'Cannot approve results before submission',
    { 
      operation: 'approve_results',
      currentStatus: 'pending',
      requiredStatus: 'submitted'
    }
  );

  addNotification({
    type: 'warning',
    title: 'Operation Not Allowed',
    message: getErrorMessage(customError),
  });
};
```

### Supabase Error Handling

```tsx
import { supabase } from '../lib/supabase';

const handleSupabaseOperation = async () => {
  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error; // This will be handled by error handler

    return data;
  } catch (error) {
    const appError = handleError(error, {
      operation: 'fetch_student_results',
      studentId
    });
    
    // Error handler automatically detects Supabase errors
    // and maps them to appropriate error types
  }
};
```

### Retry Logic

```tsx
const { shouldRetry, getRetryDelay } = useErrorHandler();

const handleWithRetry = async (operation: () => Promise<any>) => {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      const appError = handleError(error);
      
      if (shouldRetry(appError) && attempts < maxAttempts - 1) {
        attempts++;
        await new Promise(resolve => 
          setTimeout(resolve, getRetryDelay(appError))
        );
        continue;
      }
      
      throw appError;
    }
  }
};
```

---

## 🧩 Component Examples

### Login Component

```tsx
'use client';

import { useState } from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { useErrorHandler } from '../utils/ErrorHandler';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, addNotification } = useGlobalContext();
  const { handleError, getErrorMessage } = useErrorHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      addNotification({
        type: 'success',
        title: 'Welcome!',
        message: 'Successfully logged in.',
      });
    } catch (error) {
      const appError = handleError(error, { 
        operation: 'login',
        email 
      });
      
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: getErrorMessage(appError),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Data Table Component

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { useErrorHandler } from '../utils/ErrorHandler';

export function ResultsTable() {
  const { state, fetchResults, addNotification } = useGlobalContext();
  const { handleError, getErrorMessage } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      await fetchResults();
      addNotification({
        type: 'success',
        title: 'Data Loaded',
        message: 'Results loaded successfully.',
      });
    } catch (error) {
      const appError = handleError(error, { 
        operation: 'load_results' 
      });
      
      addNotification({
        type: 'error',
        title: 'Failed to Load',
        message: getErrorMessage(appError),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { results, isLoading: dataLoading } = state.data;

  if (isLoading || dataLoading) {
    return <div>Loading results...</div>;
  }

  return (
    <div>
      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Score</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>{result.student_id}</td>
              <td>{result.course_id}</td>
              <td>{result.score}</td>
              <td>{result.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Protected Component

```tsx
'use client';

import { useGlobalContext } from '../contexts/GlobalContext';

interface ProtectedComponentProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: 'admin' | 'hod' | 'student';
}

export function ProtectedComponent({ 
  children, 
  requiredPermission, 
  requiredRole 
}: ProtectedComponentProps) {
  const { 
    state, 
    isAdmin, 
    isHOD, 
    isStudent, 
    hasPermission 
  } = useGlobalContext();

  // Check authentication
  if (!state.auth.isAuthenticated) {
    return <div>Please log in to access this content.</div>;
  }

  // Check role
  if (requiredRole) {
    const hasRequiredRole = 
      (requiredRole === 'admin' && isAdmin()) ||
      (requiredRole === 'hod' && isHOD()) ||
      (requiredRole === 'student' && isStudent());

    if (!hasRequiredRole) {
      return <div>You do not have the required role to access this content.</div>;
    }
  }

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div>You do not have permission to access this content.</div>;
  }

  return <>{children}</>;
}

// Usage
<ProtectedComponent requiredRole="admin" requiredPermission="approve">
  <AdminOnlyContent />
</ProtectedComponent>
```

---

## ✅ Best Practices

### 1. Error Handling

```tsx
// ✅ Good: Always handle errors
try {
  await apiCall();
} catch (error) {
  const appError = handleError(error, { context: 'component_name' });
  addNotification({
    type: 'error',
    title: 'Error',
    message: getErrorMessage(appError),
  });
}

// ❌ Bad: Ignoring errors
try {
  await apiCall();
} catch (error) {
  console.error(error); // Only logging
}
```

### 2. State Management

```tsx
// ✅ Good: Use context for global state
const { state, addNotification } = useGlobalContext();

// ❌ Bad: Local state for global data
const [user, setUser] = useState(null); // Should be in context
```

### 3. Permission Checks

```tsx
// ✅ Good: Check permissions before operations
const handleDelete = () => {
  if (!hasPermission('delete')) {
    addNotification({
      type: 'error',
      title: 'Access Denied',
      message: 'You do not have permission to delete records.',
    });
    return;
  }
  // Proceed with delete
};

// ❌ Bad: No permission checks
const handleDelete = () => {
  // Directly delete without checking permissions
};
```

### 4. Loading States

```tsx
// ✅ Good: Show loading states
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitData();
  } finally {
    setIsLoading(false);
  }
};

return (
  <button disabled={isLoading}>
    {isLoading ? 'Submitting...' : 'Submit'}
  </button>
);
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Context Not Available

**Error:** `useGlobalContext must be used within a GlobalProvider`

**Solution:** Ensure your component is wrapped with `GlobalProvider` in the layout.

#### 2. Error Handler Not Working

**Error:** Errors not being caught or displayed

**Solution:** 
- Make sure you're using `handleError()` in catch blocks
- Check that `NotificationSystem` is included in layout
- Verify error types are properly mapped

#### 3. Notifications Not Showing

**Error:** Notifications not appearing

**Solution:**
- Check that `NotificationSystem` is in the layout
- Verify `addNotification` is being called
- Check for CSS conflicts

#### 4. Permission Checks Not Working

**Error:** Permission checks always returning false

**Solution:**
- Ensure user profile is loaded in context
- Check that role is properly set in user profile
- Verify permission strings match the defined permissions

### Debug Tips

```tsx
// Add this to debug context state
const { state } = useGlobalContext();
console.log('Global State:', state);

// Add this to debug errors
const { handleError } = useErrorHandler();
const appError = handleError(error);
console.log('App Error:', appError);
```

---

## 🎯 Next Steps

1. **Test the Integration**: Visit `/integration-demo` to see the system in action
2. **Implement Supabase**: Replace TODO comments with actual Supabase calls
3. **Add More Error Types**: Extend error types as needed for your use cases
4. **Customize Notifications**: Modify notification styles and behavior
5. **Add Analytics**: Integrate error tracking with services like Sentry

---

## 📚 Additional Resources

- [Global Context API Reference](./GlobalContext.tsx)
- [Error Handler API Reference](./ErrorHandler.ts)
- [Demo Page](./integration-demo/page.tsx)
- [Supabase Integration Guide](https://supabase.com/docs)

---

**Happy coding! 🚀** 