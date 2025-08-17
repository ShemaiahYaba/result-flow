import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Server client with cookies for authenticated requests
export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(async ({ name, value, options }) => (await cookieStore).set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};

// Service role client for admin operations (server-side only)
let _supabaseService: SupabaseClient | undefined;

export function createServiceClient(): SupabaseClient {
  if (!serviceRoleKey) {
    throw new Error('Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!_supabaseService) {
    _supabaseService = createSupabaseClient(supabaseUrl!, serviceRoleKey!);
  }
  return _supabaseService;
}

// Export service client instance for direct usage (only when service role key is available)
// Note: This will be null in environments where SERVICE_ROLE_KEY is not set
export const supabaseService: SupabaseClient | null = (() => {
  try {
    return serviceRoleKey ? createServiceClient() : null;
  } catch {
    return null;
  }
})();
