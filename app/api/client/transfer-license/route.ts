import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { licenseId, newLicenseKey } = await req.json();

    if (!licenseId || !newLicenseKey) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1️⃣ Load the license
    const { data: license, error: loadError } = await supabase
      .from("License")
      .select("*")
      .eq("id", licenseId)
      .single();

    if (loadError || !license) {
      return NextResponse.json(
        { success: false, error: "License not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Update ONLY the license key — keep same email
    const { error: updateError } = await supabase
      .from("License")
      .update({
        licenseKey: newLicenseKey,     // your manually generated key
        status: "APPROVED",            // re-approve
        updatedAt: new Date().toISOString(),
      })
      .eq("id", licenseId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Log transfer request (history only)
    await supabase.from("LicenseTransferRequest").insert({
      id: crypto.randomUUID(),
      licenseId,
      oldUserEmail: license.userEmail,   // stays the same
      newUserEmail: license.userEmail,   // same email (no change)
      status: "APPROVED",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
