import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, licenseKey } = body;

    if (!reference || !licenseKey) {
      return NextResponse.json(
        { error: "Missing activation data" },
        { status: 400 }
      );
    }

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

    // Prevent duplicate activation
    const existing = await prisma.license.findFirst({
      where: {
        licenseKey,
        userId: user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "License already activated" },
        { status: 400 }
      );
    }

    // Activate license using ONLY fields that exist in your schema
    const activated = await prisma.license.create({
      data: {
        licenseKey,
        userId: user.id,
        status: "ACTIVE",
        activatedAt: new Date(), // this field exists
      },
    });

    return NextResponse.json({ license: activated });
  } catch (err: any) {
    console.error("License activation error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
