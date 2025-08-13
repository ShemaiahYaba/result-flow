"use client";
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RoleGuard({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!allowed.includes(user.role)) {
        router.replace('/unauthorized');
      }
    }
  }, [user, loading, allowed, router]);

  if (loading || !user || !allowed.includes(user.role)) return null;
  return <>{children}</>;
}
