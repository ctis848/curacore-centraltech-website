import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("LicenseRequest")
    .select(`
      id,
      userId,
      productName,
      requestKey,
      status,
      requestedAt,
      User:User (
        id,
        email,
        companyName
      ),
      ApprovedLicense:ApprovedLicense (
        licenseId,
        approvedAt,
        License:License (
          licenseKey,
          status,
          expiresAt
        )
      )
    `)
    .eq("status", "APPROVED")
    .order("requestedAt", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
