import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Must await cookies() in Next.js 16+
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user;

    // Fetch all active licenses for this user
    const licenses = await prisma.license.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
      include: {
        licenseHistory: true,
        machineActivations: true,
      },
    });

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error("Active licenses error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
