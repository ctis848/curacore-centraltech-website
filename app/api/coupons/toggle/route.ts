import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { id, active } = await req.json();

    if (!id || active === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .update({ active })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // ⭐ FIX: Use `expires` instead of `expires_at`
    const transformed = {
      id: data.id,
      code: data.code,
      type: data.type,
      value: Number(data.value),
      expires: data.expires,        // ✔ Correct field
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
