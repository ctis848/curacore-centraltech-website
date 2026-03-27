import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toCSV } from "@/lib/csv";

export async function GET() {
  const requests = await db.licenseRequest.findMany();
  const csv = toCSV(requests);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=license_requests.csv",
    },
  });
}
