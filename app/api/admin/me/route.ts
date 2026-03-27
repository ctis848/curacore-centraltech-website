import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  // Read cookies from the request headers
  const headerList = await headers();
  const cookieHeader = headerList.get("cookie") || "";

  // Extract the token cookie
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up the session and include the user
  const session = await db.session.findFirst({
    where: { token },
    include: { user: true },
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return the authenticated user
  return NextResponse.json({ user: session.user });
}
