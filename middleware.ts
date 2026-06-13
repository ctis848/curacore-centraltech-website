// FILE: middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/adminSession";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  // Allow CORS preflight + static assets
  if (req.method === "OPTIONS") return res;
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/favicon") ||
    req.nextUrl.pathname.startsWith("/assets")
  ) {
    return res;
  }

  // ⭐ EXCLUDE ALL API ROUTES
  if (req.nextUrl.pathname.startsWith("/api")) {
    return res;
  }

  // ⭐ Supabase SSR client (correct cookie adapter)
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  return handleAuth(req, res, supabase);
}

async function handleAuth(req: NextRequest, res: NextResponse, supabase: any) {
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

  // ⭐ FIX: Allow admin login page to load without checking Supabase session
  if (pathname === "/auth/admin/login") {
    return res;
  }

  // Get Supabase user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  // ⭐ Admin session cookie (signed + secure)
  const raw = req.cookies.get("admin_session")?.value;
  const adminSession = raw ? verifyAdminSession(raw) : null;

  // Public routes allowed
  if (isPublic) return res;

  // SUPERADMIN PROTECTED
  if (pathname.startsWith("/superadmin")) {
    if (!user) return redirectTo("/superadmin/login");

    const role = user.user_metadata?.role;
    if (role !== "SUPERADMIN") return redirectTo("/unauthorized");

    return res;
  }

  // ADMIN PROTECTED (pages only — NOT APIs)
  if (pathname.startsWith("/admin")) {
    if (!user) return redirectTo("/auth/admin/login");

    const role = user.user_metadata?.role;

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return redirectTo("/unauthorized");
    }

    // ⭐ Must have valid signed admin session
    if (!adminSession) {
      return redirectTo("/auth/admin/login");
    }

    return res;
  }

  // Everything else allowed
  return res;
}

// ⭐ UPDATED MATCHER — API ROUTES REMOVED
export const config = {
  matcher: [
    "/superadmin/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/client",
    "/client/",
    "/client/:path*",
    "/unauthorized",
  ],
};
