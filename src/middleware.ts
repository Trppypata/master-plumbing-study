import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Skip auth check for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  try {
    // Create Supabase client with cookie handling
    const { supabase, response } = createClient(request);

    // Refresh session if needed (important for SSR)
    const { data: { session } } = await supabase.auth.getSession();

    // If no session and route is protected, redirect to login
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If has session and trying to access login, redirect to home
    if (session && pathname === '/login') {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return response;
  } catch (error) {
    // On error, allow request but log it
    console.error('Middleware auth error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
