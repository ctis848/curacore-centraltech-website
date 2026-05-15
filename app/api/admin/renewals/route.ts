import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("renewals")
      .select(`
        id,
        license_id,
        renewed_at,
        old_expiry,
        new_expiry,
        processed_by,
        licenses (
          productName,
          userId
        )
      `)
      .order("renewed_at", { ascending: false });

    if (error) {
      console.error("Renewals fetch error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Renewals API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
