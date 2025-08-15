import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { useGlobalContext } from '../contexts/GlobalContext';
import { profileSchema, CreateProfileInput } from '../lib/validation/profiles.schema';
import { Session, User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// FIX: Corrected import path for useErrorHandler
import { useErrorHandler, ErrorType } from '../utils/ErrorHandler';
import { 
  hydrateSessionFromSSR, 
  isSessionExpired, 
  validateSessionData,
  persistSessionToStorage,
  restoreSessionFromStorage,
  type HydratedSessionData 
} from '../utils/auth/session-hydration';

// Standardized AppError type
export type AppError = {
  message: string;
  code?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  context?: Record<string, any>;
};

export type AuthStatus =
  | 'idle'             // Not yet checked (initial mount)
  | 'checking'         // Actively checking session (SSR/CSR handoff)
  | 'authenticated'    // User is logged in and session/profile loaded
  | 'unauthenticated'  // No valid session/user
  | 'loading';         // Performing an explicit action (login, signup, etc.)

export interface AuthProviderAPI {
  user: User | null;
  session: Session | null;
  profile: any | null; // Use UserProfile type if available
  isAuthenticated: boolean;
  isSessionInitialized: boolean;
  isLoading: boolean;
  status: AuthStatus;
  error: AppError | null;
  roles: ('admin' | 'hod' | 'student')[];
  login: (email: string, password: string) => Promise<void>;
  signup: (profileData: CreateProfileInput & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  fetchProfile: (force?: boolean) => Promise<void>;
  hasRole: (role: 'admin' | 'hod' | 'student') => boolean;
  hasPermission: (permission: string) => boolean;
  retryAuth: () => Promise<void>; // New helper for retry logic
}

export function useAuthProvider(ssrSessionData?: HydratedSessionData, initialRole?: string, initialUser?: any): AuthProviderAPI {
  // SSR-safe: If running on the server, return minimal context
  if (typeof window === 'undefined') {
    return {
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isSessionInitialized: false,
      isLoading: true,
      status: 'checking',
      error: null,
      roles: [],
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
      refreshSession: async () => {},
      fetchProfile: async () => {},
      hasRole: () => false,
      hasPermission: () => false,
      retryAuth: async () => {},
    };
  }
  const supabase = createClient();
  const { state, dispatch, addNotification } = useGlobalContext();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  // State
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(initialRole ? { role: initialRole } : null); // Use UserProfile type if available
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [roles, setRoles] = useState<('admin' | 'hod' | 'student')[]>([]);
  const profileCacheRef = useRef<any | null>(null);
  const retryCountRef = useRef<number>(0);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  const mapSeverity = (sev?: string): 'info' | 'warning' | 'error' | 'critical' => {
    switch (sev) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'critical';
      default:
        return 'error';
    }
  };
  
  // Helper: Standardize errors and integrate with GlobalContext
  const setAppError = useCallback((err: any, context?: Record<string, any>, showNotification = true) => {
    const appErr = handleError(err, context);
    const standardizedError = {
      message: appErr.message || 'An error occurred',
      code: appErr.code,
      severity: mapSeverity(appErr.severity),
      context: appErr.context,
    };
    setError(standardizedError);
    
    // Show notification for auth errors (avoid duplicating success notifications)
    if (showNotification && (context?.phase === 'login' || context?.phase === 'signup' || context?.phase === 'session_refresh')) {
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: standardizedError.message,
        duration: 5000,
      });
    }
  }, [handleError, addNotification]);
  

  // Helper: Load profile from localStorage cache
  const loadProfileFromCache = useCallback(() => {
    try {
      const cachedProfile = localStorage.getItem(`profile_cache_${user?.id}`);
      if (cachedProfile && user) {
        const parsed = JSON.parse(cachedProfile);
        // Validate cache is for current user and not expired (24 hours)
        if (parsed.userId === user.id && parsed.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
          profileCacheRef.current = parsed.data;
          setProfile(parsed.data);
          setRoles(parsed.data.role ? [parsed.data.role] : []);
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to load profile from cache:', error);
    }
    return false;
  }, [user]);

  // Helper: Save profile to localStorage cache
  const saveProfileToCache = useCallback((profileData: any) => {
    try {
      if (user) {
        localStorage.setItem(`profile_cache_${user.id}`, JSON.stringify({
          userId: user.id,
          data: profileData,
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.warn('Failed to save profile to cache:', error);
    }
  }, [user]);

  // Helper: Clear profile cache
  const clearProfileCache = useCallback((userId?: string) => {
    try {
      if (userId) {
        localStorage.removeItem(`profile_cache_${userId}`);
      } else {
        // Clear all profile caches
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('profile_cache_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to clear profile cache:', error);
    }
  }, []);

  // Helper: Fetch profile from DB with retry logic and exponential backoff
  const fetchProfile = useCallback(async (force = false) => {
    if (!user || !session) return;
    
    // Try cache first if not forcing refresh
    if (!force && loadProfileFromCache()) {
      setStatus('authenticated');
      return;
    }

    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    const attemptFetch = async (attempt: number): Promise<void> => {
      setIsLoading(true);
      setStatus('loading');
      setError(null);
      
      try {
        const { data, error: dbError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (dbError) throw dbError;
        
        const parsed = profileSchema.safeParse(data);
        if (!parsed.success) {
          throw { message: 'Invalid profile data', code: 'PROFILE_INVALID' };
        }
        
        setProfile(parsed.data);
        profileCacheRef.current = parsed.data;
        saveProfileToCache(parsed.data);
        setRoles(parsed.data.role ? [parsed.data.role] : []);
        setStatus('authenticated');
        retryCountRef.current = 0; // Reset retry count on success
        
      } catch (err: any) {
        console.error(`Profile fetch attempt ${attempt + 1} failed:`, err);
        
        if (attempt < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = baseDelay * Math.pow(2, attempt);
          setTimeout(() => attemptFetch(attempt + 1), delay);
        } else {
          // Final attempt failed
          setAppError(err, { phase: 'profile_fetch', attempts: maxRetries });
          setStatus('unauthenticated');
          retryCountRef.current = 0;
        }
      } finally {
        if (attempt === maxRetries - 1 || attempt === 0) {
          setIsLoading(false);
        }
      }
    };

    await attemptFetch(0);
  }, [user, session, supabase, setAppError, loadProfileFromCache, saveProfileToCache]);

  // Helper: Refresh session with timeout safeguard
  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setStatus('checking');
    setError(null);
    
    try {
      // Add timeout safeguard to prevent infinite hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => {
        sessionTimeoutRef.current = setTimeout(() => {
          reject(new Error('Session retrieval timeout'));
        }, 10000); // 10 second timeout
      });
      
      const { data, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      // Clear timeout if successful
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      
      if (sessionError) throw sessionError;
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      // Invalidate cache if user changed
      if (data.session?.user?.id !== user?.id) {
        clearProfileCache(user?.id);
        profileCacheRef.current = null;
      }
      
      setStatus(data.session?.user ? 'authenticated' : 'unauthenticated');
      
    } catch (err: any) {
      console.error('Session refresh failed:', err);
      setAppError(err, { phase: 'session_refresh' }, false); // Don't show notification for session refresh failures
      setSession(null);
      setUser(null);
      setProfile(null);
      setRoles([]);
      profileCacheRef.current = null;
      setStatus('unauthenticated');
    } finally {
      setIsLoading(false);
      // Clear timeout in case of error
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    }
  }, [supabase, setAppError, user?.id, clearProfileCache]);

  // Retry auth helper for network errors
  const retryAuth = useCallback(async () => {
    try {
      await refreshSession();
      if (user && session) {
        await fetchProfile(true);
      }
    } catch (err) {
      console.error('Auth retry failed:', err);
    }
  }, [refreshSession, fetchProfile, user, session]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setStatus('loading');
    setError(null);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      setSession(data.session);
      setUser(data.user);
      setStatus('authenticated');
      setIsSessionInitialized(true);
      addNotification({
        type: 'success',
        title: 'Login successful',
        message: `Welcome back, ${data.user?.email}!`,
      });
      await fetchProfile(true);
    } catch (err) {
      setAppError(err, { phase: 'login' });
      setStatus('unauthenticated');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, setAppError, addNotification, fetchProfile]);

  // Signup
  const signup = useCallback(async (profileData: CreateProfileInput & { password: string }) => {
    setIsLoading(true);
    setStatus('loading');
    setError(null);
    try {
      const { email, password, ...rest } = profileData;
      const { data, error: signupError } = await supabase.auth.signUp({ email, password });
      if (signupError) throw signupError;
      setSession(data.session);
      setUser(data.user);
      setStatus('authenticated');
      setIsSessionInitialized(true);
      // Insert profile into DB
      // FIX: data.user may be null, handle this
      if (!data.user) throw { message: 'Signup failed: No user returned', code: 'NO_USER' };
      const { error: dbError } = await supabase.from('profiles').insert([{ id: data.user.id, email, ...rest }]);
      if (dbError) throw dbError;
      addNotification({
        type: 'success',
        title: 'Signup successful',
        message: `Welcome! Please complete your profile.`,
      });
      await fetchProfile(true);
    } catch (err) {
      setAppError(err, { phase: 'signup' });
      setStatus('unauthenticated');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, setAppError, addNotification, fetchProfile]);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    setStatus('loading');
    setError(null);
    try {
      const currentUserId = user?.id;
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
      
      // Clear all state and cache
      setSession(null);
      setUser(null);
      setProfile(null);
      setRoles([]);
      profileCacheRef.current = null;
      clearProfileCache(currentUserId);
      setStatus('unauthenticated');
      
      addNotification({
        type: 'success',
        title: 'Logged out',
        message: 'You have been signed out.',
      });
    } catch (err) {
      setAppError(err, { phase: 'logout' });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, setAppError, addNotification, user?.id, clearProfileCache]);

  // Role/permission helpers
  const hasRole = useCallback((role: 'admin' | 'hod' | 'student') => {
    return roles.includes(role);
  }, [roles]);

  const hasPermission = useCallback((permission: string) => {
    const role = profile?.role;
    if (!role) return false;
    const permissions: Record<'admin' | 'hod' | 'student', string[]> = {
      admin: ['read', 'write', 'delete', 'approve', 'manage_users', 'manage_departments'],
      hod: ['read', 'write', 'approve', 'manage_students', 'manage_courses'],
      student: ['read'],
    };
    return permissions[role as 'admin' | 'hod' | 'student']?.includes(permission) || false;
  }, [profile]);

  // Initialize session with hardening and SSR support
  const initializeSession = useCallback(async () => {
    if (isInitializingRef.current) return; // Prevent multiple initializations
    isInitializingRef.current = true;
    
    try {
      setStatus('checking');
      setIsLoading(true);
      
      // Step 1: Try SSR session data first (prevents loading flash)
      if (ssrSessionData) {
        console.log('Hydrating from SSR session data');
        const hydratedData = hydrateSessionFromSSR(ssrSessionData);
        
        if (hydratedData.session && validateSessionData(hydratedData.session) && !isSessionExpired(hydratedData.session)) {
          setSession(hydratedData.session);
          setUser(hydratedData.user);
          setStatus('authenticated');
          
          // Try to load profile from cache first
          if (hydratedData.user && loadProfileFromCache()) {
            setStatus('authenticated');
          } else if (hydratedData.user) {
            // Queue profile fetch without blocking initialization
            fetchProfile().catch(err => {
              console.error('Profile fetch failed during SSR hydration:', err);
            });
          }
          
          // Persist to localStorage for future visits
          persistSessionToStorage(hydratedData.session, hydratedData.user);
          
          return; // Early return - SSR hydration successful
        }
      }
      
      // Step 2: Try localStorage fallback
      console.log('Trying localStorage session restore');
      const storedData = restoreSessionFromStorage();
      if (storedData.session && validateSessionData(storedData.session) && !isSessionExpired(storedData.session)) {
        setSession(storedData.session);
        setUser(storedData.user);
        setStatus('authenticated');
        
        // Try to load profile from cache
        if (storedData.user && loadProfileFromCache()) {
          setStatus('authenticated');
        } else if (storedData.user) {
          // Queue profile fetch
          fetchProfile().catch(err => {
            console.error('Profile fetch failed during localStorage restore:', err);
          });
        }
        
        return; // Early return - localStorage restore successful
      }
      
      // Step 3: Fallback to fresh session check
      console.log('Performing fresh session check');
      await refreshSession();
      
      // If we have a user after session refresh, try to fetch profile
      const currentSession = await supabase.auth.getSession();
      if (currentSession.data.session?.user) {
        await fetchProfile();
        // Persist the fresh session
        persistSessionToStorage(currentSession.data.session, currentSession.data.session.user);
      }
      
    } catch (err) {
      console.error('Session initialization failed:', err);
      // Ensure we don't stay in loading state forever
      setStatus('unauthenticated');
    } finally {
      setIsSessionInitialized(true);
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, [refreshSession, fetchProfile, supabase, ssrSessionData, loadProfileFromCache]);

  // Listen for Supabase auth state changes (auto-refresh, session sync)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear cache if user changed
        if (session?.user?.id !== user?.id) {
          clearProfileCache(user?.id);
          profileCacheRef.current = null;
        }
        
        setStatus(session?.user ? 'authenticated' : 'unauthenticated');
        
        // Persist session to localStorage
        persistSessionToStorage(session, session?.user ?? null);
        
        // Queue profile fetch with retry logic
        if (session?.user) {
          try {
            await fetchProfile();
          } catch (err) {
            console.error('Profile fetch failed in auth state change:', err);
            // Don't block auth state change for profile fetch failures
          }
        }
        
      } else if (event === 'SIGNED_OUT') {
        const currentUserId = user?.id;
        setSession(null);
        setUser(null);
        setProfile(null);
        setRoles([]);
        profileCacheRef.current = null;
        clearProfileCache(currentUserId);
        setStatus('unauthenticated');
        
        // Clear persisted session data
        persistSessionToStorage(null, null);
      }
      
      // Always ensure session is marked as initialized
      if (!isSessionInitialized) {
        setIsSessionInitialized(true);
        setIsLoading(false);
      }
    });

    // Initial session check - only run once
    initializeSession();

    return () => {
      listener?.subscription.unsubscribe();
      // Clear any pending timeouts
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

  return {
    user,
    session,
    profile,
    isAuthenticated: !!user && !!session && !!profile,
    isSessionInitialized,
    isLoading,
    status,
    error,
    roles,
    login,
    signup,
    logout,
    refreshSession,
    fetchProfile,
    hasRole,
    hasPermission,
    retryAuth, // New helper for retry logic
  };
}
