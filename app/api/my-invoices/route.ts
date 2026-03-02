import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data);
}
