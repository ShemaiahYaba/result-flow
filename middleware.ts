import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from './src/utils/supabase/server';

// Define route-role mappings
const ROUTE_ROLE_MAP = {
  '/admin': 'admin',
  '/hod': 'hod', 
  '/student': 'student'
} as const;

// Protected route patterns
const PROTECTED_ROUTES = ['/admin', '/hod', '/student'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a protected route
  const protectedRoute = PROTECTED_ROUTES.find(route => pathname.startsWith(route));
  if (!protectedRoute) {
    return NextResponse.next();
  }

  try {
    // Get session from cookies
    const supabase = createServiceClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile?.role) {
      // Redirect to login if no profile/role
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if user's role matches the required route role
    const requiredRole = ROUTE_ROLE_MAP[protectedRoute as keyof typeof ROUTE_ROLE_MAP];
    if (profile.role !== requiredRole) {
      // Redirect to unauthorized if role doesn't match
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/hod/:path*', 
    '/student/:path*'
  ]
};
