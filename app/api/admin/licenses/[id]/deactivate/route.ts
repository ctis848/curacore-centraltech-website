import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const { error } = await supabaseAdmin
    .from("License")
    .update({
      status: "INACTIVE",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to deactivate license." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "License deactivated successfully.",
  });
}
