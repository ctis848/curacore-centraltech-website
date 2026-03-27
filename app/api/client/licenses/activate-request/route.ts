import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
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

    // Parse request body
    const { licenseKey, machineId, productName } = await req.json();

    if (!licenseKey || !machineId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create activation request (or log it)
    const activation = await prisma.machineActivation.create({
      data: {
        licenseId: licenseKey,
        machineId,
        machineName: productName || "Unknown Machine",
        osVersion: null,
        ipAddress: null,
      },
    });

    return NextResponse.json({ success: true, activation });
  } catch (error) {
    console.error("Activation request error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
