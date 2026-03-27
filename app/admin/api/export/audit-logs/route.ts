import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  const logs = await db.auditLog.findMany();
  const csv = toCSV(logs);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=audit_logs.csv",
    },
  });
}
