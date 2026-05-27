import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";
import { hashResetToken } from "@/lib/security/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Optional: verify admin exists
    const { data: admin } = await supabaseAdmin
      .from("Admins")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (!admin) {
      // Do NOT reveal existence
      return NextResponse.json({
        message: "If this email is registered, a reset link has been sent.",
      });
    }

    const rawToken = randomUUID();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 mins

    await supabaseAdmin.from("AdminPasswordResetTokens").insert({
      admin_email: email,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/auth/admin/reset-password?token=${rawToken}`;

    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (apiKey && notifyEmail) {
      const payload = {
        sender: { name: "CentralCore Admin", email: notifyEmail },
        to: [{ email }],
        subject: "Admin Password Reset",
        htmlContent: `
          <h2>Admin Password Reset</h2>
          <p>You requested a password reset for your admin account.</p>
          <p>
            <a href="${resetLink}"
               style="padding:12px 20px;background:#2563eb;color:white;border-radius:6px;text-decoration:none;">
               Reset Password
            </a>
          </p>
          <p>This link will expire in 30 minutes and can be used only once.</p>
        `,
      };

      // fire and forget
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Reset email error:", err));
    }

    return NextResponse.json({
      message: "If this email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
