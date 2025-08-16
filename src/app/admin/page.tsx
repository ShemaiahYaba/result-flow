import AdminDashboard, { DashboardStats } from "./AdminDashboard";
import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase";
import { GlobalProvider } from "@/contexts/GlobalContext";

export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";

export default async function AdminPage() {
  const cookieHeader = cookies().toString();
  let user, session, error;
  try {
    user = requireUser();
  } catch (e) {
    console.error('[ADMIN PAGE] requireUser threw:', e);
    throw e;
  }
  const supabase = createServerSupabase(cookieHeader);
  const sessionResult = await supabase.auth.getSession();
  session = sessionResult.data.session;
  error = sessionResult.error;
  console.log('[ADMIN PAGE] session:', session);
  console.log('[ADMIN PAGE] error:', error);
  console.log('[ADMIN PAGE] user:', user);

  if (!session || error) {
    throw new Error('Unauthorized: session missing or error');
  }

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
