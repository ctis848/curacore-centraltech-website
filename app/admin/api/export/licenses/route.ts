import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  const licenses = await db.license.findMany();
  const csv = toCSV(licenses);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=licenses.csv",
    },
  });
}
