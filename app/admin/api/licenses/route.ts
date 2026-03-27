import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const licenses = await db.license.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(licenses);
}
