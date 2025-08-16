// app/admin/layout.tsx
import type { ReactNode } from "react";
import { LayoutDashboard, Gavel, FileSliders, CheckCircle, Building, UserCog } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/departments", label: "Departments", icon: Building },
  { href: "/admin/manage-hods", label: "Manage HODs", icon: UserCog },
  { href: "/admin/grading-policy", label: "Grading Policy", icon: Gavel },
  { href: "/admin/marksheet-format", label: "Marksheet Format", icon: FileSliders },
  { href: "/admin/approve-results", label: "Approve Results", icon: CheckCircle },
];

import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { GlobalProvider } from "@/contexts/GlobalContext";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // SSR: fetch session and user (throws if not authenticated)
  const user = await requireUser();
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <GlobalProvider supabaseSessionData={session}>
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

