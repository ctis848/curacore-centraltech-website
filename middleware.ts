import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value;

  const publicPaths = [
    '/login',
    '/signup',
    '/reset-password',
    '/verify-email',
    '/',
    '/pricing',
    '/contact',
    '/features',
    '/services',
    '/resources',
    '/download',
    '/buy'
  ];

  const { pathname } = req.nextUrl;

  // Allow public pages
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // If user is NOT logged in and tries to access protected pages
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If user IS logged in and tries to access login/signup
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/reset-password', '/verify-email'],
};
