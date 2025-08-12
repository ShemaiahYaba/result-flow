// ============================================================
// 📋 Error Handler Utility
// ============================================================
// Comprehensive error handling for ResultFlow application
// ============================================================

import { PostgrestError } from '@supabase/supabase-js';

// ============================================================
// ERROR TYPES
// ============================================================

export enum ErrorType {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_ACCOUNT_SUSPENDED = 'AUTH_ACCOUNT_SUSPENDED',

  // Database Errors
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',
  DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
  DB_FOREIGN_KEY_VIOLATION = 'DB_FOREIGN_KEY_VIOLATION',
  DB_UNIQUE_VIOLATION = 'DB_UNIQUE_VIOLATION',
  DB_NOT_FOUND = 'DB_NOT_FOUND',

  // File Upload Errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_INVALID_FORMAT = 'FILE_INVALID_FORMAT',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',

  // Validation Errors
  VALIDATION_REQUIRED_FIELD = 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE = 'VALIDATION_OUT_OF_RANGE',
  VALIDATION_DUPLICATE_ENTRY = 'VALIDATION_DUPLICATE_ENTRY',

  // Network Errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_CONNECTION_LOST = 'NETWORK_CONNECTION_LOST',
  NETWORK_SERVER_ERROR = 'NETWORK_SERVER_ERROR',

  // Business Logic Errors
  BUSINESS_INVALID_OPERATION = 'BUSINESS_INVALID_OPERATION',
  BUSINESS_INSUFFICIENT_DATA = 'BUSINESS_INSUFFICIENT_DATA',
  BUSINESS_WORKFLOW_VIOLATION = 'BUSINESS_WORKFLOW_VIOLATION',

  // System Errors
  SYSTEM_UNKNOWN_ERROR = 'SYSTEM_UNKNOWN_ERROR',
  SYSTEM_CONFIGURATION_ERROR = 'SYSTEM_CONFIGURATION_ERROR',
  SYSTEM_MAINTENANCE_MODE = 'SYSTEM_MAINTENANCE_MODE',
}

// ============================================================
// ERROR INTERFACES
// ============================================================

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userFriendly: boolean;
  retryable: boolean;
  context?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: AppError;
  timestamp: string;
  requestId?: string;
}

// ============================================================
// ERROR MESSAGES
// ============================================================

const ERROR_MESSAGES: Record<ErrorType, string> = {
  // Authentication Errors
  [ErrorType.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorType.AUTH_USER_NOT_FOUND]: 'User account not found.',
  [ErrorType.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorType.AUTH_INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action.',
  [ErrorType.AUTH_ACCOUNT_SUSPENDED]: 'Your account has been suspended. Please contact support.',

  // Database Errors
  [ErrorType.DB_CONNECTION_ERROR]: 'Unable to connect to the database. Please try again later.',
  [ErrorType.DB_QUERY_ERROR]: 'Database query failed. Please try again.',
  [ErrorType.DB_CONSTRAINT_VIOLATION]: 'Data validation failed. Please check your input.',
  [ErrorType.DB_FOREIGN_KEY_VIOLATION]: 'Related data not found. Please check your selection.',
  [ErrorType.DB_UNIQUE_VIOLATION]: 'This record already exists. Please use a different value.',
  [ErrorType.DB_NOT_FOUND]: 'The requested data was not found.',

  // File Upload Errors
  [ErrorType.FILE_TOO_LARGE]: 'File size exceeds the maximum limit. Please choose a smaller file.',
  [ErrorType.FILE_INVALID_FORMAT]: 'File format not supported. Please use the correct format.',
  [ErrorType.FILE_CORRUPTED]: 'File appears to be corrupted. Please try uploading again.',
  [ErrorType.FILE_UPLOAD_FAILED]: 'File upload failed. Please try again.',

  // Validation Errors
  [ErrorType.VALIDATION_REQUIRED_FIELD]: 'This field is required. Please fill it in.',
  [ErrorType.VALIDATION_INVALID_FORMAT]: 'Invalid format. Please check your input.',
  [ErrorType.VALIDATION_OUT_OF_RANGE]: 'Value is out of acceptable range.',
  [ErrorType.VALIDATION_DUPLICATE_ENTRY]: 'This value already exists. Please choose another.',

  // Network Errors
  [ErrorType.NETWORK_TIMEOUT]: 'Request timed out. Please check your connection and try again.',
  [ErrorType.NETWORK_CONNECTION_LOST]: 'Connection lost. Please check your internet and try again.',
  [ErrorType.NETWORK_SERVER_ERROR]: 'Server error occurred. Please try again later.',

  // Business Logic Errors
  [ErrorType.BUSINESS_INVALID_OPERATION]: 'This operation is not allowed in the current state.',
  [ErrorType.BUSINESS_INSUFFICIENT_DATA]: 'Insufficient data to complete this operation.',
  [ErrorType.BUSINESS_WORKFLOW_VIOLATION]: 'This action violates the workflow rules.',

  // System Errors
  [ErrorType.SYSTEM_UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ErrorType.SYSTEM_CONFIGURATION_ERROR]: 'System configuration error. Please contact support.',
  [ErrorType.SYSTEM_MAINTENANCE_MODE]: 'System is under maintenance. Please try again later.',
};

// ============================================================
// ERROR SEVERITY LEVELS
// ============================================================

const ERROR_SEVERITY: Record<ErrorType, 'low' | 'medium' | 'high' | 'critical'> = {
  // Authentication Errors
  [ErrorType.AUTH_INVALID_CREDENTIALS]: 'medium',
  [ErrorType.AUTH_USER_NOT_FOUND]: 'medium',
  [ErrorType.AUTH_SESSION_EXPIRED]: 'medium',
  [ErrorType.AUTH_INSUFFICIENT_PERMISSIONS]: 'high',
  [ErrorType.AUTH_ACCOUNT_SUSPENDED]: 'high',

  // Database Errors
  [ErrorType.DB_CONNECTION_ERROR]: 'critical',
  [ErrorType.DB_QUERY_ERROR]: 'high',
  [ErrorType.DB_CONSTRAINT_VIOLATION]: 'medium',
  [ErrorType.DB_FOREIGN_KEY_VIOLATION]: 'medium',
  [ErrorType.DB_UNIQUE_VIOLATION]: 'medium',
  [ErrorType.DB_NOT_FOUND]: 'low',

  // File Upload Errors
  [ErrorType.FILE_TOO_LARGE]: 'low',
  [ErrorType.FILE_INVALID_FORMAT]: 'low',
  [ErrorType.FILE_CORRUPTED]: 'medium',
  [ErrorType.FILE_UPLOAD_FAILED]: 'medium',

  // Validation Errors
  [ErrorType.VALIDATION_REQUIRED_FIELD]: 'low',
  [ErrorType.VALIDATION_INVALID_FORMAT]: 'low',
  [ErrorType.VALIDATION_OUT_OF_RANGE]: 'low',
  [ErrorType.VALIDATION_DUPLICATE_ENTRY]: 'low',

  // Network Errors
  [ErrorType.NETWORK_TIMEOUT]: 'medium',
  [ErrorType.NETWORK_CONNECTION_LOST]: 'medium',
  [ErrorType.NETWORK_SERVER_ERROR]: 'high',

  // Business Logic Errors
  [ErrorType.BUSINESS_INVALID_OPERATION]: 'medium',
  [ErrorType.BUSINESS_INSUFFICIENT_DATA]: 'medium',
  [ErrorType.BUSINESS_WORKFLOW_VIOLATION]: 'medium',

  // System Errors
  [ErrorType.SYSTEM_UNKNOWN_ERROR]: 'high',
  [ErrorType.SYSTEM_CONFIGURATION_ERROR]: 'critical',
  [ErrorType.SYSTEM_MAINTENANCE_MODE]: 'medium',
};

// ============================================================
// ERROR HANDLER CLASS
// ============================================================

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // ============================================================
  // ERROR CREATION
  // ============================================================

  createError(
    type: ErrorType,
    details?: string,
    context?: Record<string, any>
  ): AppError {
    const error: AppError = {
      type,
      message: ERROR_MESSAGES[type],
      details,
      timestamp: new Date(),
      severity: ERROR_SEVERITY[type],
      userFriendly: true,
      retryable: this.isRetryable(type),
      context,
    };

    this.logError(error);
    return error;
  }

  // ============================================================
  // ERROR PARSING
  // ============================================================

  parseSupabaseError(error: PostgrestError): AppError {
    const { code, message, details } = error;

    // Map Supabase error codes to our error types
    switch (code) {
      case '23505': // unique_violation
        return this.createError(ErrorType.DB_UNIQUE_VIOLATION, details);
      case '23503': // foreign_key_violation
        return this.createError(ErrorType.DB_FOREIGN_KEY_VIOLATION, details);
      case '23514': // check_violation
        return this.createError(ErrorType.DB_CONSTRAINT_VIOLATION, details);
      case '42P01': // undefined_table
        return this.createError(ErrorType.DB_QUERY_ERROR, details);
      case '42703': // undefined_column
        return this.createError(ErrorType.DB_QUERY_ERROR, details);
      default:
        return this.createError(ErrorType.DB_QUERY_ERROR, message);
    }
  }

  parseNetworkError(error: any): AppError {
    if (error.name === 'TimeoutError') {
      return this.createError(ErrorType.NETWORK_TIMEOUT);
    }

    if (error.code === 'NETWORK_ERROR') {
      return this.createError(ErrorType.NETWORK_CONNECTION_LOST);
    }

    if (error.status >= 500) {
      return this.createError(ErrorType.NETWORK_SERVER_ERROR);
    }

    if (error.status === 401) {
      return this.createError(ErrorType.AUTH_SESSION_EXPIRED);
    }

    if (error.status === 403) {
      return this.createError(ErrorType.AUTH_INSUFFICIENT_PERMISSIONS);
    }

    if (error.status === 404) {
      return this.createError(ErrorType.DB_NOT_FOUND);
    }

    return this.createError(ErrorType.SYSTEM_UNKNOWN_ERROR, error.message);
  }

  parseValidationError(field: string, value: any, rule: string): AppError {
    switch (rule) {
      case 'required':
        return this.createError(ErrorType.VALIDATION_REQUIRED_FIELD, `Field: ${field}`);
      case 'format':
        return this.createError(ErrorType.VALIDATION_INVALID_FORMAT, `Field: ${field}`);
      case 'range':
        return this.createError(ErrorType.VALIDATION_OUT_OF_RANGE, `Field: ${field}`);
      case 'unique':
        return this.createError(ErrorType.VALIDATION_DUPLICATE_ENTRY, `Field: ${field}`);
      default:
        return this.createError(ErrorType.VALIDATION_INVALID_FORMAT, `Field: ${field}`);
    }
  }

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  handleError(error: any, context?: Record<string, any>): AppError {
    let appError: AppError;

    // Handle Supabase errors
    if (error && typeof error === 'object' && 'code' in error) {
      appError = this.parseSupabaseError(error as PostgrestError);
    }
    // Handle network errors
    else if (error && typeof error === 'object' && 'status' in error) {
      appError = this.parseNetworkError(error);
    }
    // Handle validation errors
    else if (error && typeof error === 'object' && 'field' in error) {
      appError = this.parseValidationError(error.field, error.value, error.rule);
    }
    // Handle unknown errors
    else {
      appError = this.createError(
        ErrorType.SYSTEM_UNKNOWN_ERROR,
        error?.message || 'Unknown error occurred',
        context
      );
    }

    // Add context if provided
    if (context) {
      appError.context = { ...appError.context, ...context };
    }

    return appError;
  }

  // ============================================================
  // ERROR LOGGING
  // ============================================================

  private logError(error: AppError): void {
    this.errorLog.push(error);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', {
        type: error.type,
        message: error.message,
        details: error.details,
        severity: error.severity,
        timestamp: error.timestamp,
        context: error.context,
      });
    }

    // TODO: Send to error tracking service in production
    // if (process.env.NODE_ENV === 'production') {
    //   this.sendToErrorTracking(error);
    // }
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  private isRetryable(type: ErrorType): boolean {
    const retryableErrors = [
      ErrorType.NETWORK_TIMEOUT,
      ErrorType.NETWORK_CONNECTION_LOST,
      ErrorType.NETWORK_SERVER_ERROR,
      ErrorType.DB_CONNECTION_ERROR,
      ErrorType.FILE_UPLOAD_FAILED,
    ];

    return retryableErrors.includes(type);
  }

  getErrorMessage(error: AppError): string {
    return error.userFriendly ? error.message : 'An unexpected error occurred.';
  }

  shouldRetry(error: AppError): boolean {
    return error.retryable;
  }

  getRetryDelay(error: AppError): number {
    const baseDelay = 1000; // 1 second
    const severityMultiplier = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 5,
    };

    return baseDelay * severityMultiplier[error.severity];
  }

  // ============================================================
  // ERROR RESPONSE CREATION
  // ============================================================

  createErrorResponse(error: AppError, requestId?: string): ErrorResponse {
    return {
      success: false,
      error,
      timestamp: error.timestamp.toISOString(),
      requestId,
    };
  }

  // ============================================================
  // BATCH ERROR HANDLING
  // ============================================================

  handleBatchErrors(errors: any[]): AppError[] {
    return errors.map(error => this.handleError(error));
  }

  getMostSevereError(errors: AppError[]): AppError | null {
    if (errors.length === 0) return null;

    const severityOrder = ['critical', 'high', 'medium', 'low'];
    return errors.reduce((mostSevere, current) => {
      const mostSevereIndex = severityOrder.indexOf(mostSevere.severity);
      const currentIndex = severityOrder.indexOf(current.severity);
      return currentIndex < mostSevereIndex ? current : mostSevere;
    });
  }

  // ============================================================
  // ERROR RECOVERY
  // ============================================================

  canRecoverFromError(error: AppError): boolean {
    const recoverableErrors = [
      ErrorType.AUTH_SESSION_EXPIRED,
      ErrorType.NETWORK_TIMEOUT,
      ErrorType.NETWORK_CONNECTION_LOST,
      ErrorType.FILE_UPLOAD_FAILED,
      ErrorType.VALIDATION_REQUIRED_FIELD,
      ErrorType.VALIDATION_INVALID_FORMAT,
      ErrorType.VALIDATION_OUT_OF_RANGE,
    ];

    return recoverableErrors.includes(error.type);
  }

  getRecoveryAction(error: AppError): string | null {
    switch (error.type) {
      case ErrorType.AUTH_SESSION_EXPIRED:
        return 'redirect_to_login';
      case ErrorType.NETWORK_TIMEOUT:
      case ErrorType.NETWORK_CONNECTION_LOST:
        return 'retry_request';
      case ErrorType.FILE_UPLOAD_FAILED:
        return 'retry_upload';
      case ErrorType.VALIDATION_REQUIRED_FIELD:
      case ErrorType.VALIDATION_INVALID_FORMAT:
      case ErrorType.VALIDATION_OUT_OF_RANGE:
        return 'show_validation_form';
      default:
        return null;
    }
  }
}

// ============================================================
// HOOKS FOR REACT COMPONENTS
// ============================================================

export const useErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance();

  const handleError = (error: any, context?: Record<string, any>) => {
    return errorHandler.handleError(error, context);
  };

  const createError = (type: ErrorType, details?: string, context?: Record<string, any>) => {
    return errorHandler.createError(type, details, context);
  };

  const getErrorMessage = (error: AppError) => {
    return errorHandler.getErrorMessage(error);
  };

  const shouldRetry = (error: AppError) => {
    return errorHandler.shouldRetry(error);
  };

  const canRecoverFromError = (error: AppError) => {
    return errorHandler.canRecoverFromError(error);
  };

  const getRecoveryAction = (error: AppError) => {
    return errorHandler.getRecoveryAction(error);
  };

  return {
    handleError,
    createError,
    getErrorMessage,
    shouldRetry,
    canRecoverFromError,
    getRecoveryAction,
  };
};

// ============================================================
// EXPORTS
// ============================================================

export default ErrorHandler; 