import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("id, name, license_count, renewal_date, annual_price, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: "Failed to load companies", error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, companies: data || [] },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error", error: err },
      { status: 500 }
    );
  }
}
