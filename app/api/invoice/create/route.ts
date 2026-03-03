import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function POST(req: Request) {
  const { email, amount, currency, plan, quantity } = await req.json();

  if (!email || !amount || !currency || !plan) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("invoices")
    .insert({
      email,
      amount,
      currency,
      plan,
      quantity: quantity || 1,
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, invoice: data });
}
