import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();
    const body = await req.json();

    const { id, email, companyName, licenseKey, requestKey, createdAt } = body;

    if (!id || !email || !companyName || !licenseKey || !requestKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Insert into ApprovedLicense
    const { error: saveErr } = await supabase
      .from("ApprovedLicense")
      .insert([
        {
          email,
          companyName,
          licenseKey,
          requestKey,
          createdAt: createdAt || new Date().toISOString(),
        },
      ]);

    if (saveErr) {
      console.error("Save error:", saveErr);
      return NextResponse.json(
        { error: "Failed to save license", details: saveErr },
        { status: 500 }
      );
    }

    // 2️⃣ Update the SAME row in LicenseRequests using id
    const { error: updateErr } = await supabase
      .from("LicenseRequests")
      .update({
        status: "APPROVED",
        sentAt: new Date().toISOString(),
        licenseKey, // ⭐ optional: store license in the row
      })
      .eq("id", id);

    if (updateErr) {
      console.error("Update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update request", details: updateErr },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "License inserted and row updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err },
      { status: 500 }
    );
  }
}
