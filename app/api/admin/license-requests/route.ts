import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  // Call the RPC function instead of using .select()
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
}
