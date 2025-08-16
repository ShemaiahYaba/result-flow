import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side anon key
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to extract the access token from the Supabase auth cookie
function getAccessTokenFromCookie() {
  try {
    const cookieStore = cookies();
    // Next.js 13+ App Router: cookies() returns ReadonlyRequestCookies, which has .getAll()
    // In some environments it may be a promise, so handle both
    let allCookies: { name: string; value: string }[] = [];
    if (typeof (cookieStore as any).getAll === 'function') {
      allCookies = (cookieStore as any).getAll();
    } else if (typeof cookieStore === 'object' && Array.isArray(cookieStore)) {
      allCookies = cookieStore as { name: string; value: string }[];
    }
    // Find the first cookie that starts with 'sb-' and ends with '-auth-token'
    const tokenCookie = allCookies.find((c: { name: string; value: string }) => typeof c.name === 'string' && c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
    if (!tokenCookie || typeof tokenCookie.value !== 'string') return null;
    // The value is a base64-encoded JSON string, or sometimes just a JWT
    let payload = null;
    try {
      // Attempt to decode as base64 JSON (Supabase v2)
      const base64Payload = tokenCookie.value.split('.')[1];
      // Use atob for base64 decoding (Buffer is not available in edge runtimes)
      const jsonPayload = atob(base64Payload);
      payload = JSON.parse(jsonPayload);
      return payload.access_token || null;
    } catch {
      // Fallback: just use the cookie value directly (Supabase v1)
      return tokenCookie.value || null;
    }
  } catch {
    return null;
  }
}

// Server-side with optional auth and Authorization header
export const createServerSupabase = (cookieHeader?: string) => {
  const accessToken = getAccessTokenFromCookie();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    },
  });
};

// Server-side service role (for secure table queries)
export const supabaseService = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
