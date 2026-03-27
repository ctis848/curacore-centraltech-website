import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  const tenants = await db.tenant.findMany();
  const csv = toCSV(tenants);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=tenants.csv",
    },
  });
}
