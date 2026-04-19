import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1) Check if user already exists in your app DB
    const { data: existingUser } = await admin
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 2) Create Supabase Auth user
    const { data, error } = await admin.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Signup failed" },
        { status: 400 }
      );
    }

    const authUser = data.user;

    // 3) Create application user profile
    const { error: insertError } = await admin.from("User").insert({
      id: authUser.id,
      email,
      name: name || null,
      role: "CLIENT",
      emailVerified: null, // or new Date() if auto‑verified
    });

    if (insertError) {
      console.error("Profile insert error:", insertError);

      // Roll back auth user if profile creation fails
      await admin.auth.admin.deleteUser(authUser.id);

      return NextResponse.json(
        { error: "Failed to create user profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
