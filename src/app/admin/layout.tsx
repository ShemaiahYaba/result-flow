'use client';

// app/admin/layout.tsx
import type { ReactNode } from "react";
import { LayoutDashboard, Gavel, FileSliders, CheckCircle, Building, UserCog } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";
import { GlobalProvider } from "@/contexts/GlobalContext";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/departments", label: "Departments", icon: Building },
  { href: "/admin/manage-hods", label: "Manage HODs", icon: UserCog },
  { href: "/admin/grading-policy", label: "Grading Policy", icon: Gavel },
  { href: "/admin/marksheet-format", label: "Marksheet Format", icon: FileSliders },
  { href: "/admin/approve-results", label: "Approve Results", icon: CheckCircle },
];

import { useGlobalContext } from '@/contexts/GlobalContext';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { state } = useGlobalContext();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!state.auth.user || state.auth.profile?.role !== 'admin') {
        window.location.href = '/unauthorized';
      }
    }
  }, [state.auth.user, state.auth.profile]);

  if (!state.auth.user || state.auth.profile?.role !== 'admin') {
    return <div>Unauthorized. Redirecting...</div>;
  }

  return (
    <GlobalProvider>
      {/* Sidebar and layout structure remain unchanged */}
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <DashboardSidebar navItems={navItems} />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </GlobalProvider>
  );
}
