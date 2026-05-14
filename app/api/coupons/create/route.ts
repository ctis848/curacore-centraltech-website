import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { code, type, value, expires, max_uses } = await req.json();

    // Validate required fields
    if (!code || !value || !expires || !max_uses) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const expires_at = new Date(expires).toISOString();

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        code,
        type,
        value: Number(value),
        expires_at,
        max_uses: Number(max_uses),
        used: 0,
        active: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Transform DB → Frontend shape
    const transformed = {
      id: data.id,
      code: data.code,
      type: data.type,
      value: Number(data.value),
      expires: data.expires_at,
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
