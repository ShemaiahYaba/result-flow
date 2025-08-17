// Client-side authentication guard for React components/pages
import { useAuth } from '@/providers/AuthProvider';

/**
 * Throws if not authenticated. Returns user if authenticated.
 * Use inside client components only.
 */
export function requireUser() {
  const { user } = useAuth();
  if (!user) throw new Error('Unauthorized');
  return user;
}
