'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/UnifiedAuthProvider';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, role } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'hod') {
        router.push('/hod');
      } else if (role === 'student') {
        router.push('/student');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, role, router]);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}
