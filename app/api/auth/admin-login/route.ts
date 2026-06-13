// FILE: app/api/auth/admin-login/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { signAdminSession } from "@/lib/adminSession";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const res = NextResponse.json({ success: true });
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

  const role = data.user.user_metadata?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Not authorized" },
      { status: 403 }
    );
  }

  const sessionData = {
    role,
    createdAt: Date.now(),
  };

  res.cookies.set("admin_session", signAdminSession(sessionData), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return res;
}
