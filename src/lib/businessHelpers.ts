import { supabaseClient } from '../utils/supabase/client';
import type { UserProfile } from '../contexts/GlobalContext';

export async function loginHelper(email: string, password: string, dispatch: any, router: any, dashboardRoute: string, roleLabel: string) {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    dispatch({ type: 'SET_USER', payload: data.user });
    router.push(dashboardRoute);
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: `login-redirect-${Date.now()}`,
      type: 'success',
      title: 'Redirecting',
      message: `Taking you to the ${roleLabel} dashboard...`,
      timestamp: new Date(),
    }});
  } catch (error) {
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: `login-error-${Date.now()}`,
      type: 'error',
      title: 'Login Failed',
      message: (error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Login failed',
      timestamp: new Date(),
    }});
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
}

export async function logoutHelper(dispatch: any, setSession: any, router: any) {
  try {
    await supabaseClient.auth.signOut();
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_ROLE', payload: null });
    dispatch({ type: 'CLEAR_PROFILE' });
    dispatch({ type: 'CLEAR_DATA' });
    setSession(null);
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    router.push('/');
    if (typeof window !== 'undefined') {
      setTimeout(() => window.location.reload(), 50);
    }
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `logout-success-${Date.now()}`,
        type: 'info',
        title: 'Logged Out',
        message: 'You have been logged out.',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: `logout-error-${Date.now()}`,
      type: 'error',
      title: 'Logout Failed',
      message: (error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Logout failed',
      timestamp: new Date(),
    }});
  }
}

export async function updateProfileHelper(
  profile: Partial<UserProfile>,
  state: any,
  dispatch: any
) {
  try {
    // Example: update profile in Supabase
    // await supabaseClient.from('profiles').update(profile).eq('id', state.auth.user?.id);
    const currentProfile = state.auth.profile || { id: '', fullname: '', email: '', role: 'student' };
    const updatedProfile: UserProfile = {
      id: profile.id ?? currentProfile.id,
      fullname: profile.fullname ?? currentProfile.fullname,
      email: profile.email ?? currentProfile.email,
      role: profile.role ?? currentProfile.role,
    };
    dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `profile-update-${Date.now()}`,
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: `profile-update-error-${Date.now()}`,
      type: 'error',
      title: 'Profile Update Failed',
      message: (error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Profile update failed',
      timestamp: new Date(),
    }});
    throw error;
  }
}
