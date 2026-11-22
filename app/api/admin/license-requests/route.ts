import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET → List all license requests
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("LicenseRequest")
    .select("*")
    .order("requestedAt", { ascending: false });

  if (error) {
    console.error("List error:", error);
    return NextResponse.json(
      { error: "Failed to load license requests", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data || []);
}

// POST → Save license key
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, licenseKey } = body;

    if (!id || !licenseKey) {
      return NextResponse.json(
        { error: "Missing id or licenseKey" },
        { status: 400 }
      );
    }

    console.log("Updating LicenseRequest:", { id, licenseKey });

    const { data, error } = await supabaseAdmin
      .from("LicenseRequest")
      .update({
        licenseKey,
        status: "APPROVED",
        sentAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Save error:", error);
      return NextResponse.json(
        {
          error: "Failed to save license key",
          details: error.message,
          code: error.code,
          hint: error.hint,
          fullError: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "License key saved successfully",
      data,
    });
  } catch (err: any) {
    console.error("Save License Error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}