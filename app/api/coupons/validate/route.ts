import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { couponCode, amount } = await req.json();

    if (!couponCode || !amount) {
      return NextResponse.json(
        { valid: false, reason: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch coupon (always uppercase)
    const { data: c, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())
      .single();

    if (error || !c) {
      return NextResponse.json({ valid: false, reason: "Coupon not found" });
    }

    // Check active
    if (!c.active) {
      return NextResponse.json({ valid: false, reason: "Coupon is inactive" });
    }

    // Check expiry
    if (new Date(c.expires) < new Date()) {
      return NextResponse.json({ valid: false, reason: "Coupon has expired" });
    }

    // Check usage limit
    if (c.used >= c.max_uses) {
      return NextResponse.json({
        valid: false,
        reason: "Coupon usage limit reached",
      });
    }

    // Calculate discount
    let discount = 0;

    if (c.type === "percentage") {
      discount = (Number(c.value) / 100) * Number(amount);
    } else {
      discount = Number(c.value);
    }

    if (discount > amount) discount = amount;

    const finalAmount = Number(amount) - discount;

    return NextResponse.json({
      valid: true,
      discount,
      finalAmount,

      // ⭐ Return coupon in a UI‑friendly format
      coupon: {
        id: c.id,
        code: c.code,
        type: c.type,          // "percentage" | "fixed"
        value: Number(c.value), // discount value
        discountType: c.type,   // ⭐ NEW
        discountValue: Number(c.value), // ⭐ NEW
        expires: c.expires,
        max_uses: c.max_uses,
        used: c.used,
        active: c.active,
        created_at: c.created_at,
      },
    });

  } catch (err: any) {
    return NextResponse.json(
      { valid: false, reason: err.message },
      { status: 500 }
    );
  }
}
