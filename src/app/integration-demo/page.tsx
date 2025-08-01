'use client';

import React, { useState } from 'react';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { useErrorHandler, ErrorType } from '../../utils/ErrorHandler';
import ErrorHandlerExample from '../../utils/ErrorHandlerExample';

export default function IntegrationDemo() {
  const { 
    state, 
    addNotification, 
    toggleSidebar, 
    setTheme, 
    setLanguage,
    isAdmin,
    isHOD,
    isStudent,
    hasPermission
  } = useGlobalContext();
  
  const { handleError, createError, getErrorMessage } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // DEMO: GLOBAL CONTEXT USAGE
  // ============================================================

  const handleNotificationDemo = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'This is a success notification from the global context.',
      duration: 3000,
    });
  };

  const handleThemeToggle = () => {
    const newTheme = state.ui.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    addNotification({
      type: 'info',
      title: 'Theme Changed',
      message: `Switched to ${newTheme} theme.`,
      duration: 2000,
    });
  };

  const handleLanguageChange = () => {
    const languages = ['en', 'fr', 'es'];
    const currentIndex = languages.indexOf(state.ui.language);
    const nextLanguage = languages[(currentIndex + 1) % languages.length];
    setLanguage(nextLanguage as 'en' | 'fr' | 'es');
    addNotification({
      type: 'info',
      title: 'Language Changed',
      message: `Language switched to ${nextLanguage.toUpperCase()}.`,
      duration: 2000,
    });
  };

  const handleSidebarToggle = () => {
    toggleSidebar();
    addNotification({
      type: 'info',
      title: 'Sidebar Toggled',
      message: `Sidebar is now ${state.ui.sidebarOpen ? 'closed' : 'open'}.`,
      duration: 2000,
    });
  };

  // ============================================================
  // DEMO: ERROR HANDLER USAGE
  // ============================================================

  const handleSimulatedError = async () => {
    setIsLoading(true);
    try {
      // Simulate an API call that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Simulated API error'));
        }, 1000);
      });
    } catch (error) {
      const appError = handleError(error, { 
        operation: 'demo_api_call',
        component: 'IntegrationDemo'
      });
      
      addNotification({
        type: 'error',
        title: 'Error Demo',
        message: getErrorMessage(appError),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomError = () => {
    const customError = createError(
      ErrorType.BUSINESS_INVALID_OPERATION,
      'Demo: Cannot perform this operation in current state',
      { demo: true, operation: 'custom_error_demo' }
    );

    addNotification({
      type: 'warning',
      title: 'Custom Error',
      message: getErrorMessage(customError),
      duration: 4000,
    });
  };

  // ============================================================
  // DEMO: PERMISSION CHECKS
  // ============================================================

  const handlePermissionCheck = () => {
    const permissions = ['read', 'write', 'delete', 'approve'];
    const results = permissions.map(permission => ({
      permission,
      hasAccess: hasPermission(permission)
    }));

    const accessiblePermissions = results.filter(r => r.hasAccess);
    
    addNotification({
      type: 'info',
      title: 'Permission Check',
      message: `You have access to: ${accessiblePermissions.map(r => r.permission).join(', ') || 'none'}`,
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ResultFlow Integration Demo
        </h1>

        {/* Global Context Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Global Context Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleNotificationDemo}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Show Success Notification
            </button>
            
            <button
              onClick={handleThemeToggle}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Toggle Theme (Current: {state.ui.theme})
            </button>
            
            <button
              onClick={handleLanguageChange}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Change Language (Current: {state.ui.language.toUpperCase()})
            </button>
            
            <button
              onClick={handleSidebarToggle}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Toggle Sidebar
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Theme:</strong> {state.ui.theme}</p>
              <p><strong>Language:</strong> {state.ui.language}</p>
              <p><strong>Sidebar Open:</strong> {state.ui.sidebarOpen ? 'Yes' : 'No'}</p>
              <p><strong>Notifications:</strong> {state.ui.notifications.length}</p>
              <p><strong>Is Authenticated:</strong> {state.auth.isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User Role:</strong> {state.auth.profile?.role || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Error Handler Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Error Handler Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleSimulatedError}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {isLoading ? 'Simulating Error...' : 'Simulate API Error'}
            </button>
            
            <button
              onClick={handleCustomError}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Create Custom Error
            </button>
            
            <button
              onClick={handlePermissionCheck}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Check Permissions
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Role-Based Access:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Is Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</p>
              <p><strong>Is HOD:</strong> {isHOD() ? 'Yes' : 'No'}</p>
              <p><strong>Is Student:</strong> {isStudent() ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Error Handler Examples */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Advanced Error Handler Examples</h2>
          <ErrorHandlerExample />
        </div>
      </div>
    </div>
  );
} 