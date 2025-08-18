import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

// Types
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'hod' | 'student' | '';
  profile?: any;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'admin' | 'hod' | 'student' | '';
}

export interface AuthCallbacks {
  onAuthStateChange?: (state: AuthState) => void;
  onError?: (error: any) => void;
  onNotification?: (notification: any) => void;
}

class AuthService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private state: AuthState = {
    user: null,
    session: null,
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
    isAuthenticated: false,
    isLoading: false,
    role: '',
  };

  private callbacks: AuthCallbacks = {};
  private refreshTimer: NodeJS.Timeout | null = null;

  // Initialize auth service with callbacks
  initialize(callbacks: AuthCallbacks) {
    this.callbacks = callbacks;
    this.setupAuthListener();
    this.checkInitialSession();
  }

  // Get current auth state
  getState(): AuthState {
    return { ...this.state };
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    if (!this.state.tokenExpiresAt) return true;
    return Date.now() >= this.state.tokenExpiresAt - 60000; // 1 minute buffer
  }

  // Get access token, refresh if needed
  async getAccessToken(): Promise<string | null> {
    if (!this.state.accessToken) return null;
    
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
    
    return this.state.accessToken;
  }

  // Sign in with JWT
  async signInWithJWT(email: string, password: string): Promise<void> {
    try {
      this.updateState({ isLoading: true });

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session returned');

      // Store tokens in memory
      const expiresAt = Date.now() + (data.session.expires_in * 1000);
      
      this.updateState({
        session: data.session,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        tokenExpiresAt: expiresAt,
      });

      // Fetch user profile and role
      await this.fetchUserProfile(data.session.user);
      
      // Setup auto-refresh
      this.setupTokenRefresh();

      this.callbacks.onNotification?.({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back!',
      });

    } catch (error: any) {
      this.callbacks.onError?.(error);
      throw error;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      this.updateState({ isLoading: true });

      // Clear refresh timer
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      // Sign out from Supabase
      await this.supabase.auth.signOut();

      // Clear state
      this.updateState({
        user: null,
        session: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        isAuthenticated: false,
        role: '',
      });

      this.callbacks.onNotification?.({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been logged out.',
      });

    } catch (error: any) {
      this.callbacks.onError?.(error);
      throw error;
    } finally {
      this.updateState({ isLoading: false });
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) throw error;
      if (!data.session) throw new Error('No session returned');

      const expiresAt = Date.now() + (data.session.expires_in * 1000);
      
      this.updateState({
        session: data.session,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        tokenExpiresAt: expiresAt,
      });

      this.setupTokenRefresh();

    } catch (error: any) {
      // If refresh fails, sign out
      await this.signOut();
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  // Fetch user profile from database
  private async fetchUserProfile(user: User): Promise<void> {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const authUser: AuthUser = {
        id: user.id,
        email: user.email || '',
        role: profile?.role || '',
        profile,
      };

      this.updateState({
        user: authUser,
        isAuthenticated: true,
        role: profile?.role || '',
      });

    } catch (error: any) {
      this.callbacks.onError?.(error);
      throw error;
    }
  }

  // Setup automatic token refresh
  private setupTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.state.tokenExpiresAt) return;

    // Refresh 1 minute before expiry
    const refreshTime = this.state.tokenExpiresAt - Date.now() - 60000;
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken().catch(console.error);
      }, refreshTime);
    }
  }

  // Setup auth state listener
  private setupAuthListener(): void {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        this.updateState({
          user: null,
          session: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          isAuthenticated: false,
          role: '',
        });
      } else if (event === 'TOKEN_REFRESHED' && session) {
        const expiresAt = Date.now() + (session.expires_in * 1000);
        this.updateState({
          session,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          tokenExpiresAt: expiresAt,
        });
        this.setupTokenRefresh();
      }
    });
  }

  // Check initial session on app start
  private async checkInitialSession(): Promise<void> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        const expiresAt = Date.now() + (session.expires_in * 1000);
        this.updateState({
          session,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          tokenExpiresAt: expiresAt,
        });

        await this.fetchUserProfile(session.user);
        this.setupTokenRefresh();
      }
    } catch (error: any) {
      this.callbacks.onError?.(error);
    }
  }

  // Update state and notify listeners
  private updateState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.callbacks.onAuthStateChange?.(this.getState());
  }

  // Role checking utilities
  hasRole(role: 'admin' | 'hod' | 'student'): boolean {
    return this.state.role === role;
  }

  hasPermission(permission: string): boolean {
    const permissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'approve', 'manage_users', 'manage_departments'],
      hod: ['read', 'write', 'approve', 'manage_students', 'manage_courses'],
      student: ['read'],
    };
    return permissions[this.state.role]?.includes(permission) || false;
  }

  // API helper for authenticated requests
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
