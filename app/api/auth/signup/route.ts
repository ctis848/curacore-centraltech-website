import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();
    const { name, email, password } = await req.json();

    // -----------------------------
    // 1. Basic validation
    // -----------------------------
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // -----------------------------
    // 2. Create user in Supabase Auth
    // -----------------------------
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          name, // stored in user_metadata
        },
      },
    });

    // -----------------------------
    // 3. Handle signup errors
    // -----------------------------
    if (error) {
      let friendly = error.message;

      if (error.message.includes("already registered")) {
        friendly = "This email is already registered. Try logging in instead.";
      }

      return NextResponse.json({ error: friendly }, { status: 400 });
    }

    // -----------------------------
    // 4. Success response
    // -----------------------------
    return NextResponse.json({
      success: true,
      message: "Signup successful. Check your email to verify your account.",
      user: data.user,
    });
  } catch (err) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: "Unexpected server error. Please try again." },
      { status: 500 }
    );
  }
}
