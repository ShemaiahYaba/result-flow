'use client';

import React, { useEffect } from 'react';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationSystem: React.FC = () => {
  const { state, removeNotification, clearNotifications } = useGlobalContext();
  const { notifications } = state.ui;

  // Auto-remove notifications after duration
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.duration) {
        const timeout = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBackgroundColor(notification.type)} border rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out transform translate-x-0 opacity-100`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => removeNotification(notification.id)}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={clearNotifications}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem; 