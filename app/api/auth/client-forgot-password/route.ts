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

    // Check if client exists (do not reveal existence)
    const { data: client } = await supabaseAdmin
      .from("Clients")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (!client) {
      return NextResponse.json({
        message: "If this email is registered, a reset link has been sent.",
      });
    }

    // Generate secure token
    const rawToken = randomUUID();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 mins

    // Store token
    await supabaseAdmin.from("ClientPasswordResetTokens").insert({
      client_email: email,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
    });

    // Build reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/auth/client/reset-password?token=${rawToken}`;

    // Brevo config
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.NOTIFY_EMAIL;

    if (!apiKey || !senderEmail) {
      console.error("Brevo config missing");
      return NextResponse.json({
        message: "If this email is registered, a reset link has been sent.",
      });
    }

    // Email payload
    const payload = {
      sender: { name: "CentralCore Support", email: senderEmail },
      to: [{ email }],
      subject: "Client Password Reset",
      htmlContent: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your client account.</p>
        <p>
          <a href="${resetLink}"
             style="padding:12px 20px;background:#2563eb;color:white;border-radius:6px;text-decoration:none;">
             Reset Password
          </a>
        </p>
        <p>This link will expire in 30 minutes and can be used only once.</p>
      `,
    };

    // Send email
    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!emailRes.ok) {
      console.error("Brevo error:", await emailRes.text());
    }

    return NextResponse.json({
      message: "If this email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Client forgot password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
