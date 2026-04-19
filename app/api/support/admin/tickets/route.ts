import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tickets = await db.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return NextResponse.json({ tickets });
}
