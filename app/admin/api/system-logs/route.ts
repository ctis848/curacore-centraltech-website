import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const logs = await db.apiLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(logs);
}
