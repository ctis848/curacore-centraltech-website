import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: any) {
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

    // Ensure client is accessing their own license
    const license = await prisma.license.findUnique({
      where: { id: params.id },
      include: {
        licenseHistory: true,
        machineActivations: true,
      },
    });

    if (!license || license.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not found or not allowed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ license });
  } catch (error) {
    console.error("License fetch error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
