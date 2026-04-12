import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient, LicenseStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch ACTIVE licenses for this user
    const licenses = await prisma.license.findMany({
      where: {
        userId,
        status: LicenseStatus.ACTIVE,
      },
      include: {
        machineActivations: true,
      },
    });

    // Transform for UI
    const formatted = licenses.map((l) => ({
      id: l.id,
      licenseKey: l.licenseKey ?? "",
      productName: l.productName ?? "",
      machineId: l.machineActivations[0]?.machineId ?? "",
      status: l.status,
      expiresAt: l.expiresAt,
    }));

    return NextResponse.json({ licenses: formatted });
  } catch (error) {
    console.error("Active licenses error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
