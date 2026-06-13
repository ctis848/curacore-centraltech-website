// FILE: middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ⭐ PUBLIC ROUTES (must be handled BEFORE Supabase)
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

  // ⭐ Allow public routes to load normally
  if (isPublic) {
    return NextResponse.next();
  }

  // ⭐ Allow static assets + OPTIONS
  if (
    req.method === "OPTIONS" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // ⭐ Allow all API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
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

  return handleAuth(req, supabase);
}

async function handleAuth(req: NextRequest, supabase: any) {
  const { pathname } = req.nextUrl;

  // ⭐ Get Supabase user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  // ⭐ Admin session cookie (plain JSON)
  const raw = req.cookies.get("admin_session")?.value;

  let adminSession = null;
  try {
    adminSession = raw ? JSON.parse(raw) : null;
  } catch {
    adminSession = null;
  }

  // ⭐ SUPERADMIN PROTECTED
  if (pathname.startsWith("/superadmin")) {
    if (!user) return redirectTo("/superadmin/login");

    const role = user.user_metadata?.role;
    if (role !== "SUPERADMIN") return redirectTo("/unauthorized");

    return NextResponse.next();
  }

  // ⭐ ADMIN PROTECTED
  if (pathname.startsWith("/admin")) {
    if (!user) return redirectTo("/auth/admin/login");

    const role = user.user_metadata?.role;

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return redirectTo("/unauthorized");
    }

    if (!adminSession) {
      return redirectTo("/auth/admin/login");
    }

    return NextResponse.next();
  }

  // ⭐ Everything else allowed
  return NextResponse.next();
}

// ⭐ MATCHER
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
