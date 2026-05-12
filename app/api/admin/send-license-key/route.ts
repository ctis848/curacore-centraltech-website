import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { licenseRequestId, generatedKey } = await req.json();

    if (!licenseRequestId || !generatedKey) {
      return NextResponse.json(
        { success: false, error: "Missing licenseRequestId or generatedKey" },
        { status: 400 }
      );
    }

    // 1. Load LicenseRequest
    const { data: request, error: reqError } = await supabaseAdmin
      .from("LicenseRequest")
      .select("*")
      .eq("id", licenseRequestId)
      .single();

    if (reqError || !request) {
      return NextResponse.json(
        { success: false, error: "LicenseRequest not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // 2. Create License (MATCHES YOUR REAL TABLE)
    const { error: insertError } = await supabaseAdmin
      .from("License")
      .insert({
        userid: request.userId,
        productName: request.productName,
        licenseKey: generatedKey,
        status: "ACTIVE",
        createdat: now,
        expiresat: null,
        annualFeePercent: 20,
        annualFeePaidUntil: null,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    // 3. Update LicenseRequest → APPROVED
    const { error: updateError } = await supabaseAdmin
      .from("LicenseRequest")
      .update({
        status: "APPROVED",
        processedat: now,
        processedby: "ADMIN",
      })
      .eq("id", licenseRequestId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
