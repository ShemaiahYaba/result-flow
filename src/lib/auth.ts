import { createServerSupabase } from './supabase';

export async function requireUser(cookieHeader?: string) {
  const supabase = createServerSupabase(cookieHeader);
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session || error) throw new Error('Unauthorized');
  return session.user;
}
