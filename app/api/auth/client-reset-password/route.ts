import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashResetToken } from "@/lib/security/token";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Hash incoming token
    const tokenHash = hashResetToken(token);

    // Find token record
    const { data: record } = await supabaseAdmin
      .from("ClientPasswordResetTokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .eq("used", false)
      .maybeSingle();

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    const clientEmail = record.client_email;

    // Get Supabase user by email
    const supabase = supabaseServer();
    const { data: users } = await supabase.auth.admin.listUsers();

    const user = users.users.find((u) => u.email === clientEmail);

    if (!user) {
      return NextResponse.json(
        { error: "Client account not found" },
        { status: 404 }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from("ClientPasswordResetTokens")
      .update({ used: true })
      .eq("token_hash", tokenHash);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("Client reset password error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
