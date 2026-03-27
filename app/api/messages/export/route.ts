import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const messages = await db.contactMessage.findMany();

  const csv =
    "id,name,email,message,createdAt\n" +
    messages
      .map((m: any) =>
        [m.id, m.name, m.email, m.message, m.createdAt.toISOString()].join(",")
      )
      .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=messages.csv",
    },
  });
}
