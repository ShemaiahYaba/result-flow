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

import { cookies } from "next/headers";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Forward cookies to Edge Function for SSR session validation
  const cookieHeader = cookies().toString();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/login-check`,
    {
      headers: {
        cookie: cookieHeader,
      },
      credentials: "include",
      cache: "no-store",
    }
  );
  const edgeSession = await res.json();
  console.log("Edge Function session", edgeSession);

  console.log("=== SSR AUTH DEBUG ===");
  // 1. Check if cookie exists at all
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  console.log("All cookies:", allCookies.map((c: { name: string }) => c.name));
  // 2. Get specific token
  const token = cookieStore.get("sb-access-token")?.value;
  console.log("Token exists:", !!token);
  console.log("Token length:", token?.length);
  if (token) {
    // 3. Check token format (should start with "ey")
    console.log("Token starts with 'ey':", token.startsWith("ey"));
    console.log("First 20 chars:", token.substring(0, 20));
    // 4. Try to decode token (don't verify, just read)
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
      console.log("Token exp:", new Date(payload.exp * 1000));
      console.log("Current time:", new Date());
      console.log("Is expired:", payload.exp * 1000 < Date.now());
    } catch (e) {
      console.log("Token decode failed:", (e as Error).message);
    }
  }

  // SSR: fetch session and profile
  const { session, user, isAuthenticated } = await getServerSession();
  // DEBUG: Log SSR session
  console.log("SSR session at /admin:", session);
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

