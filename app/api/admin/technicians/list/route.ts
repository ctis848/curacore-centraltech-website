import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("Technicians")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to fetch technicians" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
