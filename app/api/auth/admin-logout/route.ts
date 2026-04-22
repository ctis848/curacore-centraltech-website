import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Build absolute redirect URL (required by Next.js)
  const redirectUrl = new URL("/admin/login", req.url);

  const res = NextResponse.redirect(redirectUrl);

  // Clear your admin session cookie
  res.cookies.set("admin_session", "", { maxAge: 0 });

  return res;
}
