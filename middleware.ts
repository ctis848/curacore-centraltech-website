// FILE: middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Allow CORS preflight + static assets
  if (req.method === "OPTIONS") return res;
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/favicon") ||
    req.nextUrl.pathname.startsWith("/assets")
  ) {
    return res;
  }

  // Supabase SSR client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options?: any) => {
          res.cookies.set(name, value, options);
        },
        remove: (name: string) => {
          res.cookies.delete(name);
        },
      },
    }
  );

  return handleAuth(req, res, supabase);
}

async function handleAuth(
  req: NextRequest,
  res: NextResponse,
  supabase: ReturnType<typeof createServerClient>
) {
  const { pathname } = req.nextUrl;

  // PUBLIC ROUTES
  const publicExact = ["/unauthorized"];
  const publicPrefixes = [
    "/auth/client/login",
    "/auth/client/signup",
    "/auth/client/forgot-password",
    "/auth/admin/login",
    "/superadmin/login",
  ];

  const isPublic =
    publicExact.includes(pathname) ||
    publicPrefixes.some((p) => pathname.startsWith(p));

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  // If logged in and visiting an auth page → redirect to dashboard
  if (isPublic && user) {
    const role = user.user_metadata?.role;

    if (pathname.startsWith("/auth/admin")) {
      if (role === "ADMIN" || role === "SUPERADMIN") {
        return redirectTo("/admin");
      }
    }

    if (pathname.startsWith("/superadmin/login") && role === "SUPERADMIN") {
      return redirectTo("/superadmin");
    }
  }

  // Public routes allowed
  if (isPublic) return res;

  // SUPERADMIN PROTECTED
  if (pathname.startsWith("/superadmin")) {
    if (!user) return redirectTo("/superadmin/login");

    const role = user.user_metadata?.role;
    if (role !== "SUPERADMIN") return redirectTo("/unauthorized");

    return res;
  }

  // ADMIN PROTECTED (pages + APIs)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!user) return redirectTo("/auth/admin/login");

    const role = user.user_metadata?.role;
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return redirectTo("/unauthorized");
    }

    return res;
  }

  // Everything else is allowed (client portal)
  return res;
}

export const config = {
  matcher: [
    "/superadmin/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/auth/:path*",
    "/unauthorized",
  ],
};
