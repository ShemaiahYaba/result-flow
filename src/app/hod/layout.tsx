
// app/hod/layout.tsx
// Server Component: SSR role check before React mounts
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LayoutDashboard, Upload, FileText } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Header } from "@/components/layout/header";
import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { GlobalProvider } from "@/contexts/GlobalContext";

const navItems = [
  { href: "/hod", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hod/uploads", label: "Uploads", icon: Upload },
  { href: "/hod/broadsheet", label: "Broadsheet", icon: FileText },
];

export default async function HodLayout({ children }: { children: ReactNode }) {
  // SSR: fetch session and user (throws if not authenticated)
  const user = await requireUser();
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  // Optionally, fetch profile/role here if needed for sidebar, etc.
  // If you want to enforce role, fetch profile and check role:
  // const profile = await getProfileById(user.id);
  // if (!profile || profile.role !== "hod") redirect("/");

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


