import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Authentication middleware - CURRENTLY DISABLED
// To enable: uncomment the auth check below

export async function middleware(request: NextRequest) {
  // Allow all requests through without authentication
  return NextResponse.next();
  
  /* DISABLED - Uncomment to require login:
  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/api'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for session - if no session, redirect to login
  // ... auth logic here
  */
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};
