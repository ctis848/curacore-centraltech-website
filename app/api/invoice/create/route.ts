import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();

  const body = await req.json();
  const { user_id, amount, description } = body;

  if (!user_id || !amount) {
    return NextResponse.json(
      { error: "user_id and amount are required" },
      { status: 400 }
    );
  }

  // Fetch user
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

  // Create invoice
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
