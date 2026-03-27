import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect("/auth/client/login");

  res.cookies.set("token", "", { expires: new Date(0) });
  res.cookies.set("role", "", { expires: new Date(0) });

  return res;
}
