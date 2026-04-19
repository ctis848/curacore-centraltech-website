// FILE: app/api/auth/admin-login/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const res = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.headers.get("cookie") ?? undefined;
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

  // Login using Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Check admin role
  const role = data.user.user_metadata?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Not authorized" },
      { status: 403 }
    );
  }

  return res;
}
