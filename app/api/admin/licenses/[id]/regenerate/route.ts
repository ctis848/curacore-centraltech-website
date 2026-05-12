import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function generateLicenseKey() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase();
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const newKey = generateLicenseKey();

  const { error } = await supabaseAdmin
    .from("License")
    .update({
      licenseKey: newKey,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to regenerate license key." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "License key regenerated successfully.",
    newKey,
  });
}
