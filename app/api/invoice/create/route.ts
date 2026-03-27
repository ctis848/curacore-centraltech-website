import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, amount, description } = body;

  if (!user_id || !amount) {
    return NextResponse.json(
      { error: "user_id and amount are required" },
      { status: 400 }
    );
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", user_id)
    .single();

  if (userError || !userData) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id,
      amount,
      description: description || "",
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invoice: data });
}
