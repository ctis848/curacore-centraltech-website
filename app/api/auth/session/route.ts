import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Must await cookies() in Next.js 16+
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || null;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Validate session
    const session = await db.session.findFirst({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Return user info
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { user: null, error: "Server error" },
      { status: 500 }
    );
  }
}
