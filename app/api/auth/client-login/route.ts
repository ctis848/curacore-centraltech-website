// FILE: app/api/auth/client-login/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Validate user exists
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Validate password
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Ensure this is a client account
  if (user.role !== "CLIENT") {
    return NextResponse.json(
      { error: "Not a client account" },
      { status: 403 }
    );
  }

  // Create session token
  const token = crypto.randomUUID();

  // Store session
  await prisma.session.create({
    data: {
      token,
      userId: user.id,
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

  res.cookies.set("role", "CLIENT", {
    httpOnly: true,
    secure: true,
    path: "/",
  });

  return res;
}
