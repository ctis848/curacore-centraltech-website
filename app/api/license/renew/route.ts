import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { licenseKey } = await req.json();

    if (!licenseKey) {
      return NextResponse.json(
        { error: "Missing license key" },
        { status: 400 }
      );
    }

    // Find license using the REAL unique field
    const license = await prisma.license.findUnique({
      where: { licenseKey },
    });

    if (!license) {
      return NextResponse.json(
        { error: "License not found" },
        { status: 404 }
      );
    }

    // Update expiration or renewal logic
    const updated = await prisma.license.update({
      where: { licenseKey },
      data: {
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 year
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, license: updated });
  } catch (err: any) {
    console.error("License renewal error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
