import { createServerSupabase } from './supabase';

export async function requireUser(cookieHeader?: string) {
  console.log('[requireUser] cookieHeader:', cookieHeader);
  const supabase = createServerSupabase(cookieHeader);
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('[requireUser] session:', session);
  console.log('[requireUser] error:', error);
  if (!session || error) throw new Error('Unauthorized');
  return session.user;
}
