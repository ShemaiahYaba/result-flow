'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from "react";
import { LayoutDashboard, History, User, ListPlus, ListCheck } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/providers/UnifiedAuthProvider";

const navItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/course-registration", label: "Course Registration", icon: ListPlus },
  { href: "/student/past-results", label: "Past Results", icon: History },
  { href: "/student/profile", label: "My Profile", icon: User },
];

function StudentGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, role, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/');
        return;
      }

      if (role !== 'student') {
        router.push('/403');
        return;
      }

      setLoading(false);
    }
  }, [isAuthenticated, user, role, isLoading, router]);

  // Monitor auth state changes
  useEffect(() => {
    if (!isAuthenticated && !loading && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, loading, isLoading, router]);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated and is student
  if (isAuthenticated && role === 'student') {
    return <>{children}</>;
  }

  // Fallback - should not reach here due to redirects above
  return null;
}

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <StudentGuard>
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <DashboardSidebar navItems={navItems} />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </StudentGuard>
  );
}


