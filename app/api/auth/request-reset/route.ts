import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Find user
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "No account found with that email" },
      { status: 404 }
    );
  }

  // Generate reset token
  const token = crypto.randomUUID();

  // Store reset token
  await db.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes
    },
  });

  return NextResponse.json({
    success: true,
    resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`,
  });
}
