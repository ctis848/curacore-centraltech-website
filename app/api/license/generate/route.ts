import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate license key
    const licenseKey = crypto.randomUUID();

    // Ensure no duplicate license key exists
    const existing = await prisma.license.findUnique({
      where: { licenseKey },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Generated license key already exists. Try again." },
        { status: 500 }
      );
    }

    // Create license
    await prisma.license.create({
      data: {
        userId: user.id,
        licenseKey,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      licenseKey,
    });
  } catch (err: any) {
    console.error("License generation error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
