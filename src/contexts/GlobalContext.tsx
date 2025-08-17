'use client';

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '../lib/supabase';

// ============================================================
// TYPES & INTERFACES
// ============================================================

// User profile interface (simplified)
export interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  role: 'admin' | 'hod' | 'student';
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
  user: any | null;
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
  // Add session and role for compatibility with page checks
  session?: any | null;
  role?: string;
}

// ============================================================
// ACTION TYPES
// ============================================================

export type AuthAction =
  | { type: 'SET_USER'; payload: any | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_ROLE'; payload: 'admin' | 'hod' | 'student' | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_PROFILE' }
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
        isAuthenticated: true,
      };
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
      };
    case 'SET_ROLE':
      // Only update the role in profile, not the full profile object
      if (!state.profile) {
        return {
          ...state,
          profile: {
            id: '',
            fullname: '',
            email: '',
            role: action.payload || 'student',
          },
        };
      }
      return {
        ...state,
        profile: {
          ...state.profile,
          role: action.payload || 'student',
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_PROFILE':
      return {
        ...state,
        profile: null,
      };
    case 'LOGOUT':
      return {
        user: null,
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
    user: { id: 'demo-user' },
    profile: {
      id: 'demo-user',
      fullname: 'Demo User',
      email: 'demo@example.com',
      role: 'admin' as const,
    },
    isLoading: false,
    isAuthenticated: true,
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
  isAdmin: () => boolean;
  isHOD: () => boolean;
  isStudent: () => boolean;
  hasPermission: (permission: string) => boolean;
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  session: Session | null;
  setSession: (session: Session | null) => void;
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
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// ============================================================
// PROVIDER COMPONENT
// ============================================================


interface GlobalProviderProps {
  children: React.ReactNode;
  supabaseSessionData?: Session | null;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children, supabaseSessionData = null }) => {
  const router = useRouter();
  const [session, setSession] = React.useState<Session | null>(supabaseSessionData);
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Subscribe to Supabase auth changes
  React.useEffect(() => {
    const supabase = supabaseClient;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_ROLE', payload: null });
        dispatch({ type: 'CLEAR_PROFILE' });
        router.push('/');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);


  // Update profile implementation (stub, must be implemented as needed)



  const fetchDepartments = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // Simulate API call with mock data
      const mockDepartments = [
        { id: '1', department_name: 'Computer Science', department_code: 'CSC', is_active: true },
        { id: '2', department_name: 'Mathematics', department_code: 'MTH', is_active: true },
      ];
      dispatch({ type: 'SET_DEPARTMENTS', payload: mockDepartments });
    } catch (error: any) {
      console.error('Fetch departments error:', error);
      dispatch({ type: 'SET_DATA_ERROR', payload: 'Failed to fetch departments' });
    } finally {
      dispatch({ type: 'SET_DATA_LOADING', payload: false });
    }
  };

  // ============================================================
  // DATA HELPERS (simplified with mock data)
  // ============================================================

  const fetchAcademicSessions = async () => {
    try {
      dispatch({ type: 'SET_DATA_LOADING', payload: true });
      // Mock data with proper types
      const mockSessions: AcademicSession[] = [
        { 
          id: '1', 
          session_name: '2023/2024', 
          semester: 'First', 
          is_active: true,
          start_date: '2023-09-01',
          end_date: '2024-05-31'
        },
        { 
          id: '2', 
          session_name: '2022/2023', 
          semester: 'Second', 
          is_active: false,
          start_date: '2023-01-01',
          end_date: '2023-05-31'
        }
      ];
      dispatch({ type: 'SET_ACADEMIC_SESSIONS', payload: mockSessions });
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
      // Mock data with proper types
      const mockCourses: Course[] = [
        { 
          id: '1', 
          course_code: 'CSC 101', 
          course_title: 'Introduction to Computer Science', 
          unit: 3, 
          level: 100, 
          semester: 'First', 
          department_id: '1', 
          is_active: true,
          description: 'Introductory computer science course'
        },
        { 
          id: '2', 
          course_code: 'MTH 101', 
          course_title: 'General Mathematics', 
          unit: 2, 
          level: 100, 
          semester: 'First', 
          department_id: '2', 
          is_active: true,
          description: 'Fundamental mathematics course'
        }
      ];
      dispatch({ type: 'SET_COURSES', payload: mockCourses });
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
      // Mock data with proper types
      const mockStudents: Student[] = [
        { 
          id: '1', 
          matric_number: 'F/HD/21/1234567', 
          full_name: 'John Doe', 
          level: 100, 
          department_id: '1',
          profile_id: 'profile-1',
          session_id: '1',
          enrollment_date: '2021-09-01',
          is_active: true
        },
        { 
          id: '2', 
          matric_number: 'F/HD/21/7654321', 
          full_name: 'Jane Smith', 
          level: 200, 
          department_id: '1',
          profile_id: 'profile-2',
          session_id: '1',
          enrollment_date: '2021-09-01',
          is_active: true
        }
      ];
      dispatch({ type: 'SET_STUDENTS', payload: mockStudents });
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
      // Mock data with proper types
      const mockResults: Result[] = [
        { 
          id: '1', 
          student_id: '1', 
          course_id: '1', 
          session_id: '1', 
          score: 85, 
          grade: 'A', 
          grade_point: 5.0, 
          status: 'approved',
          submitted_by: 'system',
          policy_version: 1,
          remarks: 'Excellent performance'
        },
        { 
          id: '2', 
          student_id: '2', 
          course_id: '1', 
          session_id: '1', 
          score: 72, 
          grade: 'B', 
          grade_point: 4.0, 
          status: 'approved',
          submitted_by: 'system',
          policy_version: 1,
          remarks: 'Good performance'
        }
      ];
      dispatch({ type: 'SET_RESULTS', payload: mockResults });
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
      // Mock data with proper types
      const mockSubmissions: ResultSubmission[] = [
        { 
          id: '1', 
          department_id: '1', 
          course_id: '1', 
          session_id: '1', 
          status: 'approved', 
          submitted_date: '2023-06-15',
          submitted_by: 'demo-user',
          version_number: 1,
          total_records: 2,
          processed_records: 2,
          failed_records: 0
        }
      ];
      dispatch({ type: 'SET_RESULT_SUBMISSIONS', payload: mockSubmissions });
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
      // Mock data
      const mockPolicies = [
        { id: '1', grade: 'A', min_score: 70, max_score: 100, grade_point: 5.0, version: 1, is_active: true },
        { id: '2', grade: 'B', min_score: 60, max_score: 69, grade_point: 4.0, version: 1, is_active: true },
      ];
      dispatch({ type: 'SET_GRADING_POLICIES', payload: mockPolicies });
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
      // Mock data with proper types
      const mockColumns: MarksheetColumn[] = [
        { 
          id: '1', 
          column_name: 'Matric Number', 
          type: 'identifier', 
          required: true, 
          order_index: 1, 
          is_active: true 
        },
        { 
          id: '2', 
          column_name: 'Score', 
          type: 'score', 
          required: true, 
          order_index: 2, 
          is_active: true 
        }
      ];
      dispatch({ type: 'SET_MARKSHEET_COLUMNS', payload: mockColumns });
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
      // Mock data
      const mockSettings = [
        { id: '1', setting_key: 'app_name', setting_value: 'ResultFlow', is_active: true },
        { id: '2', setting_key: 'institution_name', setting_value: 'Demo University', is_active: true },
      ];
      dispatch({ type: 'SET_SYSTEM_SETTINGS', payload: mockSettings });
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
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Initialize theme from localStorage
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme });
      }

      // Initialize language from localStorage
      const savedLanguage = localStorage.getItem('language') as 'en' | 'fr' | 'es' | null;
      if (savedLanguage) {
        dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
      }
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Save theme to localStorage
      localStorage.setItem('theme', state.ui.theme);
    }
  }, [state.ui.theme]);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Save language to localStorage
      localStorage.setItem('language', state.ui.language);
    }
  }, [state.ui.language]);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const contextValue: GlobalContextType = {
    state,
    dispatch,
    session,
    setSession,
    fetchDepartments,
    fetchAcademicSessions,
    fetchCourses,
    fetchStudents,
    fetchResults,
    fetchResultSubmissions,
    fetchGradingPolicies,
    fetchMarksheetColumns,
    fetchSystemSettings,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleSidebar,
    setCurrentPage,
    setTheme,
    setLanguage,
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

// ...
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