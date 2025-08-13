
"use client";
import type { ReactNode } from 'react';
import { LayoutDashboard, Gavel, FileSliders, CheckCircle, Building, UserCog } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Header } from '@/components/layout/header';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/departments', label: 'Departments', icon: Building },
  { href: '/admin/manage-hods', label: 'Manage HODs', icon: UserCog },
  { href: '/admin/grading-policy', label: 'Grading Policy', icon: Gavel },
  { href: '/admin/marksheet-format', label: 'Marksheet Format', icon: FileSliders },
  { href: '/admin/approve-results', label: 'Approve Results', icon: CheckCircle },
];

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalContext } from "@/contexts/GlobalContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { state } = useGlobalContext();
  const user = state.auth.profile;
  const loading = state.auth.isLoading;

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  console.log("[AdminLayout] loading=", loading, "user=", user);
  if (loading || !user || user.role !== "admin") return null;

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <DashboardSidebar navItems={navItems} />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

