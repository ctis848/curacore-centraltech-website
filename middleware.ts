// middleware.ts
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected paths (add more as needed)
const protectedPaths = [
  '/dashboard',
  '/admin',
  // '/profile',
  // '/billing',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client for middleware (uses cookies from request/response)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          res.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (isProtected && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Optional: redirect logged-in users away from login page
  if (pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

// Only apply middleware to relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     * - API routes (unless you want to protect them)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
  ],
};