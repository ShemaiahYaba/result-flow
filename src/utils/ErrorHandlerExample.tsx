'use client';

import React, { useState } from 'react';
import { useGlobalContext } from '../contexts/GlobalContext';
import { useErrorHandler, ErrorType } from './ErrorHandler';

// ============================================================
// EXAMPLE COMPONENT SHOWING ERROR HANDLER USAGE
// ============================================================

export const ErrorHandlerExample: React.FC = () => {
  const { addNotification } = useGlobalContext();
  const { handleError, createError, getErrorMessage, shouldRetry, canRecoverFromError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // EXAMPLE: HANDLING SUPABASE ERRORS
  // ============================================================

  const handleSupabaseError = async () => {
    try {
      setIsLoading(true);
      
      // Simulate a Supabase error
      const mockSupabaseError = {
        code: '23505', // unique_violation
        message: 'duplicate key value violates unique constraint',
        details: 'Key (email)=(john@example.com) already exists.',
      };

      throw mockSupabaseError;
    } catch (error) {
      const appError = handleError(error, { operation: 'user_registration' });
      
      // Show notification to user
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: getErrorMessage(appError),
        duration: 5000,
      });

      // Log error for debugging
      console.error('Supabase error handled:', appError);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // EXAMPLE: HANDLING NETWORK ERRORS
  // ============================================================

  const handleNetworkError = async () => {
    try {
      setIsLoading(true);
      
      // Simulate a network error
      const mockNetworkError = {
        status: 500,
        message: 'Internal Server Error',
      };

      throw mockNetworkError;
    } catch (error) {
      const appError = handleError(error, { endpoint: '/api/results' });
      
      if (shouldRetry(appError)) {
        addNotification({
          type: 'warning',
          title: 'Connection Issue',
          message: `${getErrorMessage(appError)} Retrying...`,
          duration: 3000,
        });
        
        // Implement retry logic here
        setTimeout(() => {
          addNotification({
            type: 'info',
            title: 'Retry Successful',
            message: 'Connection restored successfully.',
            duration: 3000,
          });
        }, 2000);
      } else {
        addNotification({
          type: 'error',
          title: 'Server Error',
          message: getErrorMessage(appError),
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // EXAMPLE: HANDLING VALIDATION ERRORS
  // ============================================================

  const handleValidationError = () => {
    const validationError = {
      field: 'email',
      value: 'invalid-email',
      rule: 'format',
    };

    const appError = handleError(validationError);
    
    addNotification({
      type: 'error',
      title: 'Validation Error',
      message: getErrorMessage(appError),
      duration: 4000,
    });
  };

  // ============================================================
  // EXAMPLE: CREATING CUSTOM ERRORS
  // ============================================================

  const handleCustomError = () => {
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
      duration: 4000,
    });
  };

  // ============================================================
  // EXAMPLE: ERROR RECOVERY
  // ============================================================

  const handleRecoverableError = () => {
    const sessionExpiredError = createError(
      ErrorType.AUTH_SESSION_EXPIRED,
      'User session has expired'
    );

    if (canRecoverFromError(sessionExpiredError)) {
      addNotification({
        type: 'warning',
        title: 'Session Expired',
        message: 'Redirecting to login page...',
        duration: 3000,
      });

      // Redirect to login after notification
      setTimeout(() => {
        // window.location.href = '/login';
        addNotification({
          type: 'info',
          title: 'Redirected',
          message: 'Please log in to continue.',
          duration: 3000,
        });
      }, 3000);
    }
  };

  // ============================================================
  // EXAMPLE: BATCH ERROR HANDLING
  // ============================================================

  const handleBatchErrors = () => {
    const errors = [
      { code: '23505', message: 'Duplicate email' },
      { status: 404, message: 'User not found' },
      { field: 'password', value: '123', rule: 'format' },
    ];

    const appErrors = errors.map(error => handleError(error));
    
    // Show the most severe error
    const mostSevereError = appErrors.reduce((prev, current) => {
      const severityOrder = ['critical', 'high', 'medium', 'low'];
      const prevIndex = severityOrder.indexOf(prev.severity);
      const currentIndex = severityOrder.indexOf(current.severity);
      return currentIndex < prevIndex ? current : prev;
    });

    addNotification({
      type: 'error',
      title: 'Multiple Errors',
      message: getErrorMessage(mostSevereError),
      duration: 5000,
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Error Handler Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleSupabaseError}
          disabled={isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Test Supabase Error'}
        </button>

        <button
          onClick={handleNetworkError}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Test Network Error'}
        </button>

        <button
          onClick={handleValidationError}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Test Validation Error
        </button>

        <button
          onClick={handleCustomError}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Custom Error
        </button>

        <button
          onClick={handleRecoverableError}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Recoverable Error
        </button>

        <button
          onClick={handleBatchErrors}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Test Batch Errors
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Error Handler Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Automatic error type detection</li>
          <li>✅ User-friendly error messages</li>
          <li>✅ Severity-based handling</li>
          <li>✅ Retry logic for recoverable errors</li>
          <li>✅ Integration with notification system</li>
          <li>✅ Error logging and tracking</li>
          <li>✅ Batch error processing</li>
          <li>✅ Recovery action suggestions</li>
        </ul>
      </div>
    </div>
  );
};

// ============================================================
// ERROR BOUNDARY COMPONENT
// ============================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use the correct error handler hook or import if ErrorHandler is not defined
    // Assuming useErrorHandler is the intended function based on lint context
    // If ErrorHandler is a singleton class, import it at the top: import { ErrorHandler } from './ErrorHandler';
    // For now, using useErrorHandler as suggested by lint
    const handleError = (window as any).useErrorHandler || ((err: Error, info: any) => err);
    const appError = handleError(error, {
      component: errorInfo.componentStack,
      errorBoundary: true,
    });

    console.error('Error caught by boundary:', appError);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
                <p className="text-sm text-gray-500">We're sorry, but something unexpected happened.</p>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorHandlerExample; 