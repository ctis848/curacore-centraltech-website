// app/api/auth/client-login/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role, no cookies
);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.email || !body?.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // 1) Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = data.user;

    // 2) Supabase email verification
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Please verify your email before logging in." },
        { status: 403 }
      );
    }

    // 3) Load your app user
    const { data: profile, error: profileError } = await supabase
      .from("User")
      .select("role, emailVerified")
      .eq("email", email)
      .single();

    console.log("PROFILE DEBUG:", { profileError, profile }); // keep this for now

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Unable to load your account details." },
        { status: 403 }
      );
    }

    if (!profile.emailVerified) {
      return NextResponse.json(
        { error: "Your email is not verified yet." },
        { status: 403 }
      );
    }

    if (profile.role !== "CLIENT") {
      return NextResponse.json(
        { error: "This login page is for Clients only." },
        { status: 403 }
      );
    }

    const res = NextResponse.json({ success: true });

    res.cookies.set("role", "CLIENT", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Client login error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
