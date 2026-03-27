import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const invoices = await db.invoice.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}
