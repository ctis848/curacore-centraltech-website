import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("TransferPayments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ transfers: [] }, { status: 500 });

  return NextResponse.json({ transfers: data });
}
