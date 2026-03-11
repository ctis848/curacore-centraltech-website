import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  const { user_id, amount, description, plan } = body;

  const { data, error } = await supabase.from("invoices").insert({
    user_id,
    amount,
    description,
    plan,
    status: "pending",
  }).select().single();

  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ success: true, invoice: data });
}
