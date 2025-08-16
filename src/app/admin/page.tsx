import AdminDashboard, { DashboardStats } from "./AdminDashboard";
import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Throws if not authenticated
  const user = await requireUser();
  const supabase = createServerSupabase();

  // Fetch stats from tables: hods, departments, courses, results (pending)
  // These are example table names, adjust as needed for your schema
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

  return <AdminDashboard stats={stats} />;
}
