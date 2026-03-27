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
      include: {
        machineActivations: true, // corrected relation
      },
    });

    if (!license) {
      return NextResponse.json(
        { valid: false, error: "License not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      license,
    });
  } catch (err: any) {
    console.error("License verify error:", err);
    return NextResponse.json(
      { valid: false, error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
