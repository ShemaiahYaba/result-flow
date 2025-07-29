"use client";
import type { ReactNode } from 'react';
import { LayoutDashboard, Upload, FileText } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Header } from '@/components/layout/header';

const navItems = [
  { href: '/hod', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hod/uploads', label: 'Uploads', icon: Upload },
  { href: '/hod/broadsheet', label: 'Broadsheet', icon: FileText },
];

export default function HodLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
            <DashboardSidebar navItems={navItems} />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
        </div>
    </SidebarProvider>
  );
}
