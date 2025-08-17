"use client"
import { withAuth } from '@/providers/AuthProvider';
import { useHodDashboard } from '@/hooks/useHodDashboard';
import { HodDashboardUI } from '@/components/dashboard/HodDashboardUI';

export const dynamic = 'force-dynamic';

function HodDashboardPage() {
  const { stats, loading, logout } = useHodDashboard();
  
  return (
    <HodDashboardUI 
      stats={stats} 
      loading={loading} 
      onLogout={logout} 
    />
  );
}

export default withAuth(HodDashboardPage, ['hod']);

