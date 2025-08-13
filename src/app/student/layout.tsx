
"use client";
import type { ReactNode } from 'react';
import { LayoutDashboard, History, User } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Header } from '@/components/layout/header';

const navItems = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/past-results', label: 'Past Results', icon: History },
  { href: '/student/profile', label: 'My Profile', icon: User },
];

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGlobalContext } from "@/contexts/GlobalContext";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { state } = useGlobalContext();
  const user = state.auth.profile;
  const loading = state.auth.isLoading;

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "student") return null;

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

