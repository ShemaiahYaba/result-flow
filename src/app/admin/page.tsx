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

'use client';

export default function AdminPage() {
  const { session } = useGlobalContext();
  if (!session) {
    return <div>Unauthorized. Please log in.</div>;
  }
  return (
    <GlobalProvider>
      <AdminDashboard stats={mockStats} />
    </GlobalProvider>
  );
}

