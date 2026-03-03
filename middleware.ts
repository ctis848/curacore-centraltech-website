// middleware.ts (place in project root)

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client with cookie handling
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if needed & get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // List of protected routes (add more as needed)
  const protectedRoutes = ['/dashboard', '/admin', '/profile'];

  // Check if current path is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Optional: redirect logged-in users away from login page
  if (pathname.startsWith('/auth/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow request to continue
  return res;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/auth/login',
    // Add more protected paths here
  ],
};