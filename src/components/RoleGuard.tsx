"use client";
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RoleGuard({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth(); // ensure loading exists in AuthProvider
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!allowed.includes(user.role ?? "")) {
        router.replace('/unauthorized');
      }
    }
  }, [user, loading, allowed, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500" />
      </div>
    );
  }
  if (!user || !allowed.includes(user.role ?? "")) return null;
  return <>{children}</>;
}
