import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Transform DB → Frontend shape
    const transformed = (data || []).map((c) => ({
      id: c.id,
      code: c.code,                     // already uppercase
      type: c.type,
      value: Number(c.value),
      expires: c.expires,               // ⭐ FIXED (was expires_at)
      max_uses: c.max_uses,
      used: c.used,
      active: c.active,
      created_at: c.created_at,
    }));

    return NextResponse.json({ success: true, data: transformed });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
