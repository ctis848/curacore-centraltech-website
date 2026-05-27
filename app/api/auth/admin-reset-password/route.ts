import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashResetToken } from "@/lib/security/token";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hashPassword(password: string) {
  // Replace with your real hashing (e.g., bcrypt)
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password" },
        { status: 400 }
      );
    }

    const tokenHash = hashResetToken(token);

    const { data: resetRecord, error } = await supabaseAdmin
      .from("AdminPasswordResetTokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (resetRecord.used) {
      return NextResponse.json(
        { error: "This reset link has already been used" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (new Date(resetRecord.expires_at) < now) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    const newPasswordHash = hashPassword(password);

    // Update admin password
    const { error: updateError } = await supabaseAdmin
      .from("Admins")
      .update({ password_hash: newPasswordHash })
      .eq("email", resetRecord.admin_email);

    if (updateError) {
      console.error("Admin password update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Mark token as used (one-time use)
    await supabaseAdmin
      .from("AdminPasswordResetTokens")
      .update({ used: true })
      .eq("id", resetRecord.id);

    // 🔐 SECURITY ALERT EMAIL
    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (apiKey && notifyEmail) {
      const payload = {
        sender: { name: "CentralCore Security", email: notifyEmail },
        to: [{ email: resetRecord.admin_email }],
        subject: "Admin Password Changed",
        htmlContent: `
          <h2>Your Admin Password Was Changed</h2>
          <p>This is a security notification that your admin password was recently updated.</p>
          <p>If you did not perform this action, contact support immediately.</p>
        `,
      };

      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Security alert email error:", err));
    }

    return NextResponse.json({
      message: "Password updated successfully. You can now log in.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
