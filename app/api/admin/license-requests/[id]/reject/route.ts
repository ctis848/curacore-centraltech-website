import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: any) {
  await admin
    .from("LicenseRequest")
    .update({ status: "REJECTED", processedAt: new Date().toISOString() })
    .eq("id", params.id);

  return NextResponse.json({
    success: true,
    message: "Request rejected.",
  });
}
