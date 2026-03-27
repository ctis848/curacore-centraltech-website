import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // SAFER COOKIE PARSING
    const cookieHeader = req.headers.get("cookie") || "";

    const token = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { user: null, error: "Unauthorized: No session token" },
        { status: 401 }
      );
    }

    // VALIDATE SESSION
    const session = await prisma.session.findFirst({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { user: null, error: "Unauthorized: Invalid session" },
        { status: 401 }
      );
    }

    // RETURN USER (consistent with your AuthGuard)
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (err) {
    console.error("🔥 /api/auth/me Error:", err);

    return NextResponse.json(
      {
        user: null,
        error: "Server error. Please try again later.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
