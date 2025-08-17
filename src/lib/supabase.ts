import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

let _supabaseClient: ReturnType<typeof createClient> | undefined;
let _supabaseService: ReturnType<typeof createClient> | undefined;

export function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return _supabaseClient;
}

export function getSupabaseService() {
  if (!SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!_supabaseService) {
    _supabaseService = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);
  }
  return _supabaseService;
}

// For backward compatibility, but strongly prefer getSupabaseClient in new code
export const supabaseClient = getSupabaseClient();
export const supabaseService = getSupabaseService();

