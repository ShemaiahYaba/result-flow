
// app/hod/layout.tsx
// Server Component: SSR role check before React mounts
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LayoutDashboard, Upload, FileText } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";
import { getServerSession } from "@/utils/auth/ssr-session";
import { getProfileById } from "@/utils/auth/ssr-profile";
import { HodShell } from "@/components/HodShell";

const navItems = [
  { href: "/hod", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hod/uploads", label: "Uploads", icon: Upload },
  { href: "/hod/broadsheet", label: "Broadsheet", icon: FileText },
];

export default async function HodLayout({ children }: { children: ReactNode }) {
  // SSR: fetch session and profile
  const { session, user, isAuthenticated } = await getServerSession();
  if (!isAuthenticated || !user) {
    redirect("/");
  }
  // Fetch profile for role check
  const profile = await getProfileById(user.id);
  if (!profile || profile.role !== "hod") {
    redirect("/");
  }

  // Hydrate role and user to client
  return (
    <HodShell initialRole={profile.role} initialUser={user}>
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <DashboardSidebar navItems={navItems} />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </HodShell>
  );
}


