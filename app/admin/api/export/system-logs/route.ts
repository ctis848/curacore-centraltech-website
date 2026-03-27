import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  const logs = await db.apiLog.findMany();
  const csv = toCSV(logs);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=system_logs.csv",
    },
  });
}
