import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const logs = await db.apiLog.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error("ERROR LOGS API ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}
