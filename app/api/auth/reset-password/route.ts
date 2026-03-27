import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  // Look up reset token
  const record = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  // Hash new password
  const hashed = await bcrypt.hash(password, 10);

  // Update user password
  await db.user.update({
    where: { id: record.userId },
    data: { passwordHash: hashed },
  });

  // Delete used token
  await db.passwordResetToken.delete({
    where: { token },
  });

  return NextResponse.json({ success: true });
}
