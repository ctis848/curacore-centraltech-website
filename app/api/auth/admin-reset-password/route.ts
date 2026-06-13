import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { hashResetToken } from "@/lib/security/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password" },
        { status: 400 }
      );
    }

    // Hash incoming token to match DB
    const tokenHash = hashResetToken(token);

    // Fetch reset token record
    const { data: resetRecord, error: tokenError } = await supabaseAdmin
      .from("AdminPasswordResetTokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .eq("used", false)
      .maybeSingle();

    if (tokenError || !resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date(resetRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    const adminEmail = resetRecord.admin_email;

    // Get Supabase user by email
    const { data: usersData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("List users error:", listError);
      return NextResponse.json(
        { error: "Unable to process request" },
        { status: 500 }
      );
    }

    const user = usersData.users.find((u) => u.email === adminEmail);

    if (!user) {
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 404 }
      );
    }

    // Update password in Supabase Auth
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password,
      });

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from("AdminPasswordResetTokens")
      .update({ used: true })
      .eq("id", resetRecord.id);

    // SECURITY ALERT EMAIL
    const apiKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (apiKey && notifyEmail) {
      const payload = {
        sender: { name: "CentralCore Security", email: notifyEmail },
        to: [{ email: adminEmail }],
        subject: "Your Admin Password Was Changed",
        htmlContent: `
          <h2>Password Changed Successfully</h2>
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
      }).catch((err) =>
        console.error("Security alert email error:", err)
      );
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
