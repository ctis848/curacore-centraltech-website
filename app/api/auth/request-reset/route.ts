import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/brevo";
import { passwordResetTemplate } from "@/lib/email/templates";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // 1. Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with that email" },
        { status: 404 }
      );
    }

    // 2. Delete old tokens (prevent multiple active tokens)
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // 3. Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // 4. Store token with expiration
    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
      },
    });

    // 5. Build reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    // 6. Send branded email
    sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: passwordResetTemplate(resetUrl),
    }).catch((err) => console.error("Email send error:", err));

    return NextResponse.json({
      success: true,
      message: "Password reset email sent.",
    });
  } catch (err) {
    console.error("Request Reset Error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
