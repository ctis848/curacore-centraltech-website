import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { email, password, companyName } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Create Supabase Auth user — AUTO CONFIRMED
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // ⭐ Auto-confirm user
      });

    if (authError || !authUser?.user) {
      return NextResponse.json(
        { success: false, message: authError?.message || "Failed to create user" },
        { status: 500 }
      );
    }

    const userId = authUser.user.id;

    // 2. Create User profile (required for FK)
    const { error: userProfileError } = await supabaseAdmin
      .from("User")
      .insert({
        id: userId,
        email,
      });

    if (userProfileError) {
      return NextResponse.json(
        { success: false, message: userProfileError.message },
        { status: 500 }
      );
    }

    // 3. Create company record
    const { error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        user_id: userId,
        name: companyName,
      });

    if (companyError) {
      return NextResponse.json(
        { success: false, message: companyError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      userId,
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
