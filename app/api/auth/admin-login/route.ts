import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Find admin user
  const admin = await db.user.findUnique({ where: { email } });

  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate password
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create session token
  const token = crypto.randomUUID();

  // Store session in Session table
  await db.session.create({
    data: {
      token,
      userId: admin.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    },
  });

  // Prepare response
  const res = NextResponse.json({ success: true });

  // Set cookies
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  res.cookies.set("role", admin.role, {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  return res;
}
