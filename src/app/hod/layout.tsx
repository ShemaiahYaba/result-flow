
"use client";
import type { ReactNode } from 'react';
import { LayoutDashboard, Upload, FileText } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Header } from '@/components/layout/header';

const navItems = [
  { href: '/hod', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hod/uploads', label: 'Uploads', icon: Upload },
  { href: '/hod/broadsheet', label: 'Broadsheet', icon: FileText },
];

import { RoleGuard } from '@/components/RoleGuard';

export default function HodLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowed={['hod']}>
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <DashboardSidebar navItems={navItems} />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  );
}

