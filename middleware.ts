import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client with updated cookie handling
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
          res.cookies.delete(name); // Next.js 16 requires only 1 argument
        },
      },
    }
  );

  const { pathname } = req.nextUrl;

  // Public routes (no authentication required)
  const publicPaths = [
    "/auth/client/login",
    "/client/signup",
    "/superadmin/login",
    "/auth/admin/login",
    "/unauthorized",
  ];

  if (publicPaths.includes(pathname)) {
    return res;
  }

  return handleAuth(req, res, supabase);
}

async function handleAuth(
  req: NextRequest,
  res: NextResponse,
  supabase: ReturnType<typeof createServerClient>
) {
  const { pathname } = req.nextUrl;

  // Fetch authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (path: string) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  // SUPERADMIN PROTECTED ROUTES
  if (pathname.startsWith("/superadmin")) {
    if (!user) return redirectTo("/superadmin/login");

    const role = user.user_metadata?.role;
    if (role !== "SUPERADMIN") return redirectTo("/unauthorized");

    return res;
  }

  // ADMIN PROTECTED ROUTES
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!user) return redirectTo("/auth/admin/login");

    const role = user.user_metadata?.role;
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return redirectTo("/unauthorized");
    }

    return res;
  }

  // Default allow
  return res;
}

export const config = {
  matcher: [
    "/superadmin/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
