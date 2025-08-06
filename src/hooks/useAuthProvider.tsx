import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { useGlobalContext } from '../contexts/GlobalContext';
import { profileSchema, CreateProfileInput } from '../lib/validation/profiles.schema';
import { Session, User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// FIX: Corrected import path for useErrorHandler
import { useErrorHandler } from '../utils/ErrorHandler';

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
}

export function useAuthProvider(): AuthProviderAPI {
  const supabase = createClient();
  const { state, dispatch, addNotification } = useGlobalContext();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null); // Use UserProfile type if available
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [roles, setRoles] = useState<('admin' | 'hod' | 'student')[]>([]);
  const profileCacheRef = useRef<any | null>(null);

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
  
  // Helper: Standardize errors
  const setAppError = useCallback((err: any, context?: Record<string, any>) => {
    const appErr = handleError(err, context);
    setError({
      message: appErr.message || 'An error occurred',
      code: appErr.code,
      severity: mapSeverity(appErr.severity),
      context: appErr.context,
    });
  }, [handleError]);
  

  // Helper: Fetch profile from DB (with cache)
  const fetchProfile = useCallback(async (force = false) => {
    if (!user || !session) return;
    if (!force && profileCacheRef.current) {
      setProfile(profileCacheRef.current);
      return;
    }
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
      if (!parsed.success) throw { message: 'Invalid profile data', code: 'PROFILE_INVALID' };
      setProfile(parsed.data);
      profileCacheRef.current = parsed.data;
      setRoles([parsed.data.role]);
    } catch (err) {
      setAppError(err, { phase: 'fetchProfile' });
      setProfile(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
      setStatus(session && user ? 'authenticated' : 'unauthenticated');
    }
  }, [supabase, user, session, setAppError]);

  // Helper: Refresh session
  const refreshSession = useCallback(async () => {
    setStatus('checking');
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setStatus(data.session?.user ? 'authenticated' : 'unauthenticated');
    } catch (err) {
      setAppError(err, { phase: 'refreshSession' });
      setSession(null);
      setUser(null);
      setStatus('unauthenticated');
    } finally {
      setIsSessionInitialized(true);
      setIsLoading(false);
    }
  }, [supabase, setAppError]);

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
        message: `Welcome back!`,
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
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
      setSession(null);
      setUser(null);
      setProfile(null);
      setRoles([]);
      profileCacheRef.current = null;
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
  }, [supabase, setAppError, addNotification]);

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

  // Listen for Supabase auth state changes (auto-refresh, session sync)
  useEffect(() => {
    setStatus('checking');
    setIsLoading(true);
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
        setStatus(session?.user ? 'authenticated' : 'unauthenticated');
        await fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setRoles([]);
        profileCacheRef.current = null;
        setStatus('unauthenticated');
      }
      setIsSessionInitialized(true);
      setIsLoading(false);
    });
    // Initial session check
    // FIX: fetchProfile expects (force?: boolean), so we pass undefined
    refreshSession().then(() => fetchProfile()).finally(() => {
      setIsSessionInitialized(true);
      setIsLoading(false);
      setStatus(user && session ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  };
}
