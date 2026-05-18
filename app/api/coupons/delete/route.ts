import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing coupon ID" },
        { status: 400 }
      );
    }

    // Delete the coupon
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // ⭐ FIX: Use correct field name `expires`
    const transformed = {
      id: data.id,
      code: data.code,
      type: data.type,
      value: Number(data.value),
      expires: data.expires,     // ✔ FIXED
      max_uses: data.max_uses,
      used: data.used,
      active: data.active,
      created_at: data.created_at,
    };

    return NextResponse.json({ success: true, data: transformed });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
