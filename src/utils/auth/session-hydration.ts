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
