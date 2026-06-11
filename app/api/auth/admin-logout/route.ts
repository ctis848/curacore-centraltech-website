import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return handleLogout(req);
}

export async function POST(req: Request) {
  return handleLogout(req);
}

function handleLogout(req: Request) {
  // FIX: Correct login URL
  const redirectUrl = new URL("/auth/admin/login", req.url);

  const res = NextResponse.redirect(redirectUrl);

  // Clear admin session cookie
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 0,
  });

  return res;
}
