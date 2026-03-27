import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const logs = await db.auditLog.findMany({
    include: { admin: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(logs);
}
