import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // 1. Find token
    const record = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    // 2. Update password in Supabase
    const supabase = supabaseServer();
    const { error } = await supabase.auth.admin.updateUserById(record.userId, {
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // 3. Delete token after use
    await db.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
