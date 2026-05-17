export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const result = await prisma.license.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: "ACTIVE",
      },
      data: {
        status: "EXPIRED",
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error: any) {
    console.error("Expire licenses cron error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
