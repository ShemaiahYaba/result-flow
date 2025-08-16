import AdminDashboard, { DashboardStats } from "./AdminDashboard";
import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { GlobalProvider } from "@/contexts/GlobalContext";

export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";

export default async function AdminPage() {
  const cookieHeader = cookies().toString();
  // Throws if not authenticated
  const user = await requireUser(cookieHeader);
  const supabase = createServerSupabase(cookieHeader);
  // Fetch session for context
  const { data: { session } } = await supabase.auth.getSession();

  // Fetch stats from tables: hods, departments, courses, results (pending)
  const [{ count: totalHods }, { count: departments }, { count: courses }, { count: pendingApprovals }] = await Promise.all([
    supabase.from("hods").select("id", { count: "exact", head: true }),
    supabase.from("departments").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("results").select("id", { count: "exact", head: true }).eq("status", "Pending"),
  ]);

  const stats: DashboardStats = {
    totalHods: totalHods ?? 0,
    departments: departments ?? 0,
    courses: courses ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
  };

  return (
    <GlobalProvider supabaseSessionData={session}>
      <AdminDashboard stats={stats} />
    </GlobalProvider>
  );
}
