import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string) {
          res.cookies.set(name, value);
        },
        remove(name: string) {
          res.cookies.delete(name);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  const publicPaths = [
    "/auth/client/login",
    "/client/signup",
    "/superadmin/login",
    "/auth/admin/login",
  ];

  if (publicPaths.includes(pathname)) {
    return res;
  }

  if (pathname.startsWith("/superadmin")) {
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/superadmin/login";
      return NextResponse.redirect(url);
    }

    const role = user.user_metadata?.role;

    if (role !== "SUPERADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/admin/login";
      return NextResponse.redirect(url);
    }

    const role = user.user_metadata?.role;

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: ["/superadmin/:path*", "/admin/:path*"],
};
