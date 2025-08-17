import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

let _supabaseClient: ReturnType<typeof createBrowserClient> | undefined;

// Create a singleton browser client for client-side usage
export function createClient() {
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(supabaseUrl!, supabaseKey!);
  }
  return _supabaseClient;
}

// Export the client instance for direct usage (backward compatibility)
export const supabaseClient = createClient();
