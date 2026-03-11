import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  // Create a response early so Supabase can modify cookies
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createMiddlewareClient({ req, res });

  // Refresh session & attach to request
  await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  const publicPaths = [
    "/",
    "/client/login",
    "/client/signup",
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/pricing",
    "/contact",
    "/features",
    "/services",
    "/resources",
    "/download",
    "/buy",
  ];

  // Allow public pages
  if (publicPaths.includes(pathname)) {
    return res;
  }

  // ADMIN AREA
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const role = user.user_metadata?.role;
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return res;
  }

  // CLIENT PANEL
  if (pathname.startsWith("/client/client-panel")) {
    if (!user) {
      return NextResponse.redirect(new URL("/client/login", req.url));
    }

    return res;
  }

  return res;
}

export const config = {
  matcher: [
    "/client/client-panel/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
