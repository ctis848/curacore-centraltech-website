import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const requestId = context.params.id;

    const { data: request, error } = await supabaseAdmin
      .from("LicenseRequest")
      .select("*")
      .eq("id", requestId)
      .single();

    if (error || !request) {
      return NextResponse.json(
        { error: "License request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(request);
  } catch (err) {
    console.error("Load Request Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
