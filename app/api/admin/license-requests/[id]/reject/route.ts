// FILE: app/api/admin/license-requests/[id]/reject/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // ✅ FIXED

export async function POST(req: Request, { params }: any) {
  await supabaseAdmin
    .from("LicenseRequest")
    .update({
      status: "REJECTED",
      processedAt: new Date().toISOString(),
      processedBy: "ADMIN", // optional but recommended
    })
    .eq("id", params.id);

  return NextResponse.json({
    success: true,
    message: "Request rejected.",
  });
}
