import { Session, User } from '@supabase/supabase-js';

export interface HydratedSessionData {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Hydrate client-side auth state from SSR data
 * This prevents the flash of loading state on first paint
 */
export function hydrateSessionFromSSR(ssrData?: HydratedSessionData): HydratedSessionData {
  // If no SSR data provided, return empty state
  if (!ssrData) {
    return {
      session: null,
      user: null,
      isAuthenticated: false,
    };
  }

  // Validate SSR data structure
  if (typeof ssrData !== 'object' || ssrData === null) {
    console.warn('Invalid SSR session data provided');
    return {
      session: null,
      user: null,
      isAuthenticated: false,
    };
  }

  return {
    session: ssrData.session,
    user: ssrData.user,
    isAuthenticated: ssrData.isAuthenticated,
  };
}

/**
 * Check if session is expired
 */
export function isSessionExpired(session: Session | null): boolean {
  if (!session || !session.expires_at) {
    return true;
  }

  // Add 5 minute buffer to account for clock skew
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  const expirationTime = session.expires_at * 1000; // Convert to milliseconds
  const currentTime = Date.now();

  return currentTime >= (expirationTime - bufferTime);
}

/**
 * Extract user ID safely from session or user object
 */
export function extractUserId(session: Session | null, user: User | null): string | null {
  return session?.user?.id || user?.id || null;
}

/**
 * Validate session data integrity
 */
export function validateSessionData(session: Session | null): boolean {
  if (!session) return false;

  // Check required fields
  const requiredFields = ['access_token', 'user'];
  for (const field of requiredFields) {
    if (!session[field as keyof Session]) {
      console.warn(`Session missing required field: ${field}`);
      return false;
    }
  }

  // Check user object
  if (!session.user?.id || !session.user?.email) {
    console.warn('Session user object is invalid');
    return false;
  }

  return true;
}

/**
 * Create a minimal session object for client-side use
 * This is useful when you only have partial session data
 */
export function createMinimalSession(
  accessToken: string,
  user: User,
  expiresAt?: number
): Session {
  return {
    access_token: accessToken,
    refresh_token: '', // Will be handled by Supabase
    expires_at: expiresAt || Math.floor(Date.now() / 1000) + 3600, // 1 hour default
    expires_in: 3600,
    token_type: 'bearer',
    user,
  } as Session;
}

/**
 * Storage keys for session persistence
 */
export const SESSION_STORAGE_KEYS = {
  SESSION: 'supabase.auth.session',
  USER: 'supabase.auth.user',
  EXPIRES_AT: 'supabase.auth.expires_at',
} as const;

/**
 * Persist session data to localStorage for offline access
 */
export function persistSessionToStorage(session: Session | null, user: User | null): void {
  try {
    if (session && user) {
      localStorage.setItem(SESSION_STORAGE_KEYS.SESSION, JSON.stringify(session));
      localStorage.setItem(SESSION_STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(SESSION_STORAGE_KEYS.EXPIRES_AT, session.expires_at?.toString() || '0');
    } else {
      // Clear storage if no session
      Object.values(SESSION_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  } catch (error) {
    console.warn('Failed to persist session to storage:', error);
  }
}

/**
 * Restore session data from localStorage
 */
export function restoreSessionFromStorage(): HydratedSessionData {
  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEYS.SESSION);
    const userStr = localStorage.getItem(SESSION_STORAGE_KEYS.USER);
    const expiresAtStr = localStorage.getItem(SESSION_STORAGE_KEYS.EXPIRES_AT);

    if (!sessionStr || !userStr) {
      return { session: null, user: null, isAuthenticated: false };
    }

    const session = JSON.parse(sessionStr) as Session;
    const user = JSON.parse(userStr) as User;
    const expiresAt = parseInt(expiresAtStr || '0');

    // Check if session is expired
    if (expiresAt && Date.now() > expiresAt * 1000) {
      // Clear expired session
      Object.values(SESSION_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return { session: null, user: null, isAuthenticated: false };
    }

    return {
      session,
      user,
      isAuthenticated: !!session && !!user,
    };
  } catch (error) {
    console.warn('Failed to restore session from storage:', error);
    return { session: null, user: null, isAuthenticated: false };
  }
}
