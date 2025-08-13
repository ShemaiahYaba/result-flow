'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase/client';
const supabase = createClient();

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  phone_number?: string;
  department_id?: string;
  role: 'admin' | 'hod' | 'student';
  status: 'active' | 'inactive' | 'suspended';
  matric_number?: string;
  staff_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  department_name: string;
  department_code: string;
  description?: string;
  is_active: boolean;
}

export interface AcademicSession {
  id: string;
  session_name: string;
  semester: 'First' | 'Second' | 'Summer';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_title: string;
  unit: number;
  level: 100 | 200 | 300 | 400 | 500;
  semester: 'First' | 'Second' | 'Summer';
  department_id: string;
  description?: string;
  is_active: boolean;
}

export interface Student {
  id: string;
  matric_number: string;
  profile_id: string;
  full_name: string;
  level: 100 | 200 | 300 | 400 | 500;
  department_id: string;
  session_id: string;
  enrollment_date: string;
  graduation_date?: string;
  is_active: boolean;
}

export interface Result {
  id: string;
  student_id: string;
  course_id: string;
  session_id: string;
  score: number;
  grade?: string;
  grade_point?: number;
  policy_version?: number;
  submitted_by: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  remarks?: string;
}

export interface ResultSubmission {
  id: string;
  department_id: string;
  course_id: string;
  session_id: string;
  submitted_by: string;
  submitted_date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  file_url?: string;
  file_hash?: string;
  version_number: number;
  total_records?: number;
  processed_records?: number;
  failed_records?: number;
}

export interface GradingPolicy {
  id: string;
  grade: string;
  min_score: number;
  max_score: number;
  grade_point: number;
  version: number;
  is_active: boolean;
}

export interface MarksheetColumn {
  id: string;
  column_name: string;
  type: 'identifier' | 'score' | 'text' | 'number';
  required: boolean;
  order_index: number;
  is_active: boolean;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  is_active: boolean;
}

// ============================================================
// STATE INTERFACES
// ============================================================

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface DataState {
  departments: Department[];
  academicSessions: AcademicSession[];
  courses: Course[];
  students: Student[];
  results: Result[];
  resultSubmissions: ResultSubmission[];
  gradingPolicies: GradingPolicy[];
  marksheetColumns: MarksheetColumn[];
  systemSettings: SystemSetting[];
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  currentPage: string;
  notifications: Notification[];
  theme: 'light' | 'dark';
  language: 'en' | 'fr' | 'es';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

export interface GlobalState {
  auth: AuthState;
  data: DataState;
  ui: UIState;
}

// ============================================================
// ACTION TYPES
// ============================================================

export type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGOUT' };

export type DataAction =
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'SET_ACADEMIC_SESSIONS'; payload: AcademicSession[] }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'SET_RESULTS'; payload: Result[] }
  | { type: 'SET_RESULT_SUBMISSIONS'; payload: ResultSubmission[] }
  | { type: 'SET_GRADING_POLICIES'; payload: GradingPolicy[] }
  | { type: 'SET_MARKSHEET_COLUMNS'; payload: MarksheetColumn[] }
  | { type: 'SET_SYSTEM_SETTINGS'; payload: SystemSetting[] }
  | { type: 'SET_DATA_LOADING'; payload: boolean }
  | { type: 'SET_DATA_ERROR'; payload: string | null }
  | { type: 'CLEAR_DATA' };

export type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_CURRENT_PAGE'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'fr' | 'es' };

export type GlobalAction = AuthAction | DataAction | UIAction;

// ============================================================
// REDUCERS
// ============================================================

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
      };
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGOUT':
      return {
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

const dataReducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'SET_ACADEMIC_SESSIONS':
      return { ...state, academicSessions: action.payload };
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'SET_RESULT_SUBMISSIONS':
      return { ...state, resultSubmissions: action.payload };
    case 'SET_GRADING_POLICIES':
      return { ...state, gradingPolicies: action.payload };
    case 'SET_MARKSHEET_COLUMNS':
      return { ...state, marksheetColumns: action.payload };
    case 'SET_SYSTEM_SETTINGS':
      return { ...state, systemSettings: action.payload };
    case 'SET_DATA_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DATA_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_DATA':
      return {
        departments: [],
        academicSessions: [],
        courses: [],
        students: [],
        results: [],
        resultSubmissions: [],
        gradingPolicies: [],
        marksheetColumns: [],
        systemSettings: [],
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    default:
      return state;
  }
};

const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  return {
    auth: authReducer(state.auth, action as AuthAction),
    data: dataReducer(state.data, action as DataAction),
    ui: uiReducer(state.ui, action as UIAction),
  };
};

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: GlobalState = {
  auth: {
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  },
  data: {
    departments: [],
    academicSessions: [],
    courses: [],
    students: [],
    results: [],
    resultSubmissions: [],
    gradingPolicies: [],
    marksheetColumns: [],
    systemSettings: [],
    isLoading: false,
    error: null,
  },
  ui: {
    sidebarOpen: false,
    currentPage: '/',
    notifications: [],
    theme: 'light',
    language: 'en',
  },
};

// ============================================================
// CONTEXT
// ============================================================

interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  // Auth helpers
  login: (identifier: string, password: string, role: 'student' | 'hod' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  // Data helpers
  fetchDepartments: () => Promise<void>;
  fetchAcademicSessions: () => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchResults: () => Promise<void>;
  fetchResultSubmissions: () => Promise<void>;
  fetchGradingPolicies: () => Promise<void>;
  fetchMarksheetColumns: () => Promise<void>;
  fetchSystemSettings: () => Promise<void>;
  // UI helpers
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'fr' | 'es') => void;
  // Utility helpers
  isAdmin: () => boolean;
  isHOD: () => boolean;
  isStudent: () => boolean;
  hasPermission: (permission: string) => boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// ============================================================
// PROVIDER COMPONENT
// ============================================================

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // ============================================================
  // AUTH HELPERS
  // ============================================================

  const login = async (identifier: string, password: string, role: 'student' | 'hod' | 'admin') => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Use your Edge Function endpoint and add auth header if needed
      const response = await fetch('https://mycaofkqpuxfsmmxwmow.supabase.co/functions/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password, role }),
      });
      const result = await response.json();
      if (!response.ok) {
        const errorMsg = result?.error || 'Login failed. Please check your credentials.';
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `login-error-${Date.now()}`,
            type: 'error',
            title: 'Login Failed',
            message: errorMsg,
            timestamp: new Date(),
          },
        });
        throw new Error(errorMsg);
      }
      // If your Edge Function returns a Supabase session, set it for RLS
      if (result.session) {
        // If you have access to supabase client here, set the session:
        if (typeof supabase !== 'undefined' && supabase.auth && supabase.auth.setSession) {
          await supabase.auth.setSession(result.session);
        }
      }
      // Update state with the user/session/profile
      dispatch({ type: 'SET_USER', payload: result.session?.user || result.user });
      dispatch({ type: 'SET_SESSION', payload: result.session });
      dispatch({ type: 'SET_PROFILE', payload: result.user || result.profile });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `login-success-${Date.now()}`,
          type: 'success',
          title: 'Login Successful',
          message: `Welcome back, ${(result.user?.fullname || result.profile?.fullname || 'user')}!`,
          timestamp: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `login-error-${Date.now()}`,
          type: 'error',
          title: 'Login Failed',
          message: error.message,
          timestamp: new Date(),
        },
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Only one definition for logout, updateProfile, and fetchDepartments is allowed!
  // Remove any duplicate definitions below this point. This block is the canonical version.
  // --- LOGOUT ---
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'CLEAR_DATA' });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `logout-success-${Date.now()}`,
          type: 'info',
          title: 'Logged Out',
          message: 'You have been successfully logged out.',
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // --- UPDATE PROFILE ---
  const updateProfile = async (profileUpdates: Partial<UserProfile>) => {
    try {
      if (!state.auth.user?.id) throw new Error('No user logged in');
      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', state.auth.user.id)
        .select()
        .single();
      if (error) throw error;
      dispatch({ type: 'SET_PROFILE', payload: data });
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
      console.error('Profile update error:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `profile-error-${Date.now()}`,
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to update profile. Please try again.',
          timestamp: new Date(),
        },
      });
      throw error;
    }
  };

  // --- FETCH DEPARTMENTS ---
  const fetchDepartments = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('department_name');
      if (error) throw error;
      dispatch({ type: 'SET_DEPARTMENTS', payload: data });
    } catch (error: any) {
      console.error('Fetch departments error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch departments' });
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: `fetch-error-${Date.now()}`,
          type: 'error',
          title: 'Data Fetch Error',
          message: 'Failed to load departments. Please refresh the page.',
          timestamp: new Date(),
        },
      });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  // ============================================================
  // DATA HELPERS
  // ============================================================

  const fetchAcademicSessions = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase.from('academic_sessions').select('*');
      // if (error) throw error;
      // dispatch({ type: 'SET_ACADEMIC_SESSIONS', payload: data });
    } catch (error) {
      console.error('Fetch academic sessions error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch academic sessions' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  const fetchCourses = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase.from('courses').select('*');
      // if (error) throw error;
      // dispatch({ type: 'SET_COURSES', payload: data });
    } catch (error) {
      console.error('Fetch courses error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch courses' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  const fetchStudents = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase.from('students').select('*');
      // if (error) throw error;
      // dispatch({ type: 'SET_STUDENTS', payload: data });
    } catch (error) {
      console.error('Fetch students error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch students' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  const fetchResults = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase.from('results').select('*');
      // if (error) throw error;
      // dispatch({ type: 'SET_RESULTS', payload: data });
    } catch (error) {
      console.error('Fetch results error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch results' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  const fetchResultSubmissions = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase.from('result_submissions').select('*');
      // if (error) throw error;
      // dispatch({ type: 'SET_RESULT_SUBMISSIONS', payload: data });
    } catch (error) {
      console.error('Fetch result submissions error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch result submissions' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  const fetchGradingPolicies = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase.from('grading_policies').select('*');
      // if (error) throw error;
      // dispatch({ type: 'SET_GRADING_POLICIES', payload: data });
    } catch (error) {
      console.error('Fetch grading policies error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch grading policies' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  const fetchMarksheetColumns = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase.from('marksheet_columns').select('*');
      // if (error) throw error;
      // dispatch({ type: 'SET_MARKSHEET_COLUMNS', payload: data });
    } catch (error) {
      console.error('Fetch marksheet columns error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch marksheet columns' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  const fetchSystemSettings = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // TODO: Implement Supabase fetch
      // const { data, error } = await supabase.from('system_settings').select('*');
      // if (error) throw error;
      // dispatch({ type: 'SET_SYSTEM_SETTINGS', payload: data });
    } catch (error) {
      console.error('Fetch system settings error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch system settings' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  // ============================================================
  // UI HELPERS
  // ============================================================

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: newNotification.id });
      }, notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setCurrentPage = (page: string) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setLanguage = (language: 'en' | 'fr' | 'es') => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  // ============================================================
  // UTILITY HELPERS
  // ============================================================

  const isAdmin = (): boolean => {
    return state.auth.profile?.role === 'admin';
  };

  const isHOD = (): boolean => {
    return state.auth.profile?.role === 'hod';
  };

  const isStudent = (): boolean => {
    return state.auth.profile?.role === 'student';
  };

  const hasPermission = (permission: string): boolean => {
    const role = state.auth.profile?.role;
    if (!role) return false;

    const permissions = {
      admin: ['read', 'write', 'delete', 'approve', 'manage_users', 'manage_departments'],
      hod: ['read', 'write', 'approve', 'manage_students', 'manage_courses'],
      student: ['read'],
    };

    return permissions[role]?.includes(permission) || false;
  };

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }

    // Initialize language from localStorage
    const savedLanguage = localStorage.getItem('language') as 'en' | 'fr' | 'es';
    if (savedLanguage) {
      dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
    }
  }, []);

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', state.ui.theme);
  }, [state.ui.theme]);

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('language', state.ui.language);
  }, [state.ui.language]);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const contextValue: GlobalContextType = {
    state,
    dispatch,
    // Auth helpers
    login,
    logout,
    updateProfile,
    // Data helpers
    fetchDepartments,
    fetchAcademicSessions,
    fetchCourses,
    fetchStudents,
    fetchResults,
    fetchResultSubmissions,
    fetchGradingPolicies,
    fetchMarksheetColumns,
    fetchSystemSettings,
    // UI helpers
    addNotification,
    removeNotification,
    clearNotifications,
    toggleSidebar,
    setCurrentPage,
    setTheme,
    setLanguage,
    // Utility helpers
    isAdmin,
    isHOD,
    isStudent,
    hasPermission,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

export default GlobalContext; 