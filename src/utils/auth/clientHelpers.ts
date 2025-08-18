import { useAuth } from '@/providers/UnifiedAuthProvider';

// ============================================================
// CLIENT-SIDE AUTH HELPERS
// ============================================================

/**
 * Get the current JWT access token from in-memory storage
 * @returns string | null - JWT token or null if not authenticated
 */
export function getAccessTokenFromContext(): string | null {
  // This function should be used within React components
  // For non-React contexts, use the context directly
  return null; // Will be handled by useAuthenticatedApi hook
}

/**
 * Make an authenticated API request with JWT token from context
 * @param token - JWT token from context
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * React hook for authenticated API calls using in-memory JWT tokens
 */
export const useAuthenticatedApi = () => {
  const { authenticatedFetch: authFetch } = useAuth();

  const callApi = async (url: string, options: RequestInit = {}) => {
    try {
      return await authFetch(url, options);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const callAdminApi = async (endpoint: string, options: RequestInit = {}) => {
    return callApi(`/api/admin${endpoint}`, options);
  };

  const callGeneralApi = async (endpoint: string, options: RequestInit = {}) => {
    return callApi(`/api${endpoint}`, options);
  };

  return {
    callApi,
    callAdminApi,
    callGeneralApi,
    authenticatedFetch,
  };
};
