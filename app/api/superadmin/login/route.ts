import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== "SUPERADMIN" || !user.passwordHash) {
    const url = new URL("/superadmin/login", req.url);
    url.searchParams.set("error", "Invalid credentials");
    return NextResponse.redirect(url);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const url = new URL("/superadmin/login", req.url);
    url.searchParams.set("error", "Invalid credentials");
    return NextResponse.redirect(url);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  const redirectUrl = new URL("/superadmin", req.url);
  const res = NextResponse.redirect(redirectUrl);

  res.cookies.set("superadmin_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return res;
}
