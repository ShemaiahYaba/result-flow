'use client';

import { useGlobalContext, GlobalProvider } from '@/contexts/GlobalContext';
import AdminDashboard, { DashboardStats } from './AdminDashboard';
import React from 'react';

// Example: you can fetch stats client-side or pass them via props if hydrated from SSR
const mockStats: DashboardStats = {
  totalHods: 3,
  departments: 5,
  courses: 20,
  pendingApprovals: 2,
};

export default function AdminPage() {
  const { state } = useGlobalContext();
  // Only allow admins
  if (!state.auth.user || state.auth.profile?.role !== 'admin') {
    if (typeof window !== 'undefined') {
      // Always redirect unauthorized access to a generic unauthorized page
      window.location.href = '/unauthorized';
    }
    return <div>Unauthorized. Redirecting...</div>;
  }
  return (
    <GlobalProvider>
      <AdminDashboard stats={mockStats} />
    </GlobalProvider>
  );
}

