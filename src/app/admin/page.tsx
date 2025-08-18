'use client';
import { withAuth } from '@/providers/UnifiedAuthProvider';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminDashboardUI } from '@/components/dashboard/AdminDashboardUI';

function AdminDashboardPage() {
  const { stats, loading, signOut } = useAdminDashboard();
  
  return (
    <AdminDashboardUI 
      stats={stats} 
      loading={loading} 
      onLogout={signOut} 
    />
  );
}

export default withAuth(AdminDashboardPage, ['admin']);

