// app/admin/layout.tsx
"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, Gavel, FileSliders, CheckCircle, Building, UserCog } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";
import { RoleGuard } from "@/components/RoleGuard";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/departments", label: "Departments", icon: Building },
  { href: "/admin/manage-hods", label: "Manage HODs", icon: UserCog },
  { href: "/admin/grading-policy", label: "Grading Policy", icon: Gavel },
  { href: "/admin/marksheet-format", label: "Marksheet Format", icon: FileSliders },
  { href: "/admin/approve-results", label: "Approve Results", icon: CheckCircle },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowed={["admin"]}>
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
