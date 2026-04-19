import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const tickets = await db.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tickets });
}
