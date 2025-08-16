import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side anon key
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Server-side service role (for secure table queries)
export const supabaseService = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
