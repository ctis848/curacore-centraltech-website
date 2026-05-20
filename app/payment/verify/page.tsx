import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { success: false, message: "Missing reference" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1️⃣ Check if payment exists
    const { data: payment, error: paymentError } = await supabase
      .from("Payment")
      .select("userid")
      .eq("reference", reference)
      .maybeSingle();

    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Determine if user exists
    const existingUser = payment.userid !== null;

    // 3️⃣ Get email from Paystack metadata (stored in webhook)
    // If you stored email in Payment table, use that instead.
    const { data: user } = existingUser
      ? await supabase
          .from("auth.users")
          .select("email")
          .eq("id", payment.userid)
          .maybeSingle()
      : { data: { email: null } };

    return NextResponse.json({
      success: true,
      existingUser,
      email: user?.email ?? null,
    });
  } catch (err: any) {
    console.error("VERIFY ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
