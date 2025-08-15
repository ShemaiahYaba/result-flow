import { createClient } from '../supabase/server';
import { cookies } from 'next/headers';

/**
 * Fetches the user profile by user ID from the database (SSR-safe).
 * @param userId The Supabase user ID
 * @returns The profile object (with .role), or null if not found
 */
export async function getProfileById(userId: string) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data;
}
