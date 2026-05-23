import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ clients: [] }, { status: 500 });

  return NextResponse.json({ clients: data });
}
