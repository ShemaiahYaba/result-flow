"use client"
import { withAuth } from '@/providers/AuthProvider';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { StudentDashboardUI } from '@/components/dashboard/StudentDashboardUI';

export const dynamic = 'force-dynamic';

function StudentDashboardPage() {
  const { stats, loading, logout, downloadTranscript } = useStudentDashboard();
  
  return (
    <StudentDashboardUI 
      stats={stats} 
      loading={loading} 
      onLogout={logout} 
      onDownloadTranscript={downloadTranscript}
    />
  );
}

export default withAuth(StudentDashboardPage, ['student']);

