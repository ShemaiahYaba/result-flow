import { createClient } from '../supabase/server';
import { cookies } from 'next/headers';
import { Session, User } from '@supabase/supabase-js';

export interface SSRAuthData {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Server-side session retrieval for SSR/SSG
 * Use this in Next.js server components, pages, or API routes
 */
export async function getServerSession(): Promise<SSRAuthData> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('SSR session error:', error);
      return {
        session: null,
        user: null,
        isAuthenticated: false,
      };
    }

    return {
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
    };
  } catch (error) {
    console.error('Failed to get server session:', error);
    return {
      session: null,
      user: null,
      isAuthenticated: false,
    };
  }
}

/**
 * Serialize session data for client hydration
 * Use this to pass session data from server to client safely
 */
export function serializeSessionForClient(authData: SSRAuthData) {
  return {
    session: authData.session ? {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
      expires_in: authData.session.expires_in,
      token_type: authData.session.token_type,
      user: authData.session.user,
    } : null,
    user: authData.user,
    isAuthenticated: authData.isAuthenticated,
  };
}

/**
 * Check if user has specific role on server-side
 * Requires profile data to be fetched separately
 */
export async function checkServerRole(
  userId: string, 
  role: 'admin' | 'hod' | 'student'
): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !profile) {
      return false;
    }
    
    return profile.role === role;
  } catch (error) {
    console.error('Failed to check server role:', error);
    return false;
  }
}

/**
 * Get user profile on server-side
 */
export async function getServerProfile(userId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Failed to get server profile:', error);
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Failed to get server profile:', error);
    return null;
  }
}
