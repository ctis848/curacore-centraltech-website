import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { ticketId, status } = await req.json();

  if (!ticketId || !status) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const ticket = await db.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });

  return NextResponse.json({ success: true, ticket });
}
