"use client"
import { withAuth } from '@/providers/UnifiedAuthProvider';
import { useHodDashboard } from '@/hooks/useHodDashboard';
import { HodDashboardUI } from '@/components/dashboard/HodDashboardUI';

export const dynamic = 'force-dynamic';

function HodDashboardPage() {
  const { stats, loading, signOut } = useHodDashboard();
          
  return (
    <HodDashboardUI 
      stats={stats} 
      loading={loading} 
      onLogout={signOut} 
    />
  );
}

export default withAuth(HodDashboardPage, ['hod']);

