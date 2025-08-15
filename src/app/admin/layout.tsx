// app/admin/layout.tsx
// app/admin/layout.tsx
// Server Component: SSR role check before React mounts
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LayoutDashboard, Gavel, FileSliders, CheckCircle, Building, UserCog } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";
import { getServerSession } from "@/utils/auth/ssr-session";
import { getProfileById } from "@/utils/auth/ssr-profile";
import { AdminShell } from "@/components/AdminShell";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/departments", label: "Departments", icon: Building },
  { href: "/admin/manage-hods", label: "Manage HODs", icon: UserCog },
  { href: "/admin/grading-policy", label: "Grading Policy", icon: Gavel },
  { href: "/admin/marksheet-format", label: "Marksheet Format", icon: FileSliders },
  { href: "/admin/approve-results", label: "Approve Results", icon: CheckCircle },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // SSR: fetch session and profile
  const { session, user, isAuthenticated } = await getServerSession();
  if (!isAuthenticated || !user) {
    redirect("/");
  }
  // Fetch profile for role check
  const profile = await getProfileById(user.id);
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Hydrate role and user to client
  return (
    <AdminShell initialRole={profile.role} initialUser={user}>
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <DashboardSidebar navItems={navItems} />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AdminShell>
  );
}

