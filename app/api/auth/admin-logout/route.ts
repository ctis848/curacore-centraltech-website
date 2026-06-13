// FILE: app/api/auth/admin-logout/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/auth/admin/login", req.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieHeader = req.headers.get("cookie") ?? "";
          const cookies = Object.fromEntries(
            cookieHeader.split(";").map((c) => {
              const [k, v] = c.trim().split("=");
              return [k, v];
            })
          );
          return cookies[name];
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  await supabase.auth.signOut();

  // Remove admin session cookie
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 0,
  });

  return res;
}
