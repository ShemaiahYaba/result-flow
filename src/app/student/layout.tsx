"use client";
import type { ReactNode } from 'react';
import { LayoutDashboard, History } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Header } from '@/components/layout/header';

const navItems = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/past-results', label: 'Past Results', icon: History },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
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
