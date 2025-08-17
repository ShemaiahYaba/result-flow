'use client';
import { withAuth } from '@/providers/AuthProvider';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminDashboardUI } from '@/components/dashboard/AdminDashboardUI';

function AdminDashboardPage() {
  const { stats, loading, logout } = useAdminDashboard();
  
  return (
    <AdminDashboardUI 
      stats={stats} 
      loading={loading} 
      onLogout={logout} 
    />
  );
}

export default withAuth(AdminDashboardPage, ['admin']);

