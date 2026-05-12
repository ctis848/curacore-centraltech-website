import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const { newUserId } = await request.json();

  if (!newUserId) {
    return NextResponse.json(
      { success: false, message: "newUserId is required." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("License")
    .update({
      user_id: newUserId, // FIXED
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { success: false, message: "Failed to transfer license." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "License transferred successfully.",
  });
}
