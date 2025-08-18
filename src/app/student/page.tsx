"use client"
import { withAuth } from '@/providers/UnifiedAuthProvider';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { StudentDashboardUI } from '@/components/dashboard/StudentDashboardUI';

export const dynamic = 'force-dynamic';

function StudentDashboardPage() {
  const { stats, loading, signOut, downloadTranscript } = useStudentDashboard();
  
  return (
    <StudentDashboardUI 
      stats={stats} 
      loading={loading} 
      onLogout={signOut} 
      onDownloadTranscript={downloadTranscript}
    />
  );
}

export default withAuth(StudentDashboardPage, ['student']);

