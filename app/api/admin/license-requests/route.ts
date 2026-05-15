import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Uses your RPC to fetch license requests with email
    const { data, error } = await supabaseAdmin.rpc(
      "get_license_requests_with_email"
    );

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
