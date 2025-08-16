import { createServerSupabase } from './supabase';

import { useGlobalContext } from '@/contexts/GlobalContext';

export function requireUser() {
  // This is now a client-side hook, not an async server function
  const { session } = useGlobalContext();
  if (!session) throw new Error('Unauthorized');
  return session.user;
}
