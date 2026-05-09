import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return handleLogout(req);
}

export async function POST(req: Request) {
  return handleLogout(req);
}

function handleLogout(req: Request) {
  const redirectUrl = new URL("/admin/login", req.url);

  const res = NextResponse.redirect(redirectUrl);

  res.cookies.set("admin_session", "", {
    maxAge: 0,
    path: "/",
  });

  return res;
}
