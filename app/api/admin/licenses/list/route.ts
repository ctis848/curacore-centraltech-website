import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data } = await supabaseAdmin
    .from("companies")
    .select("*")
    .order("name");

  return NextResponse.json(data);
}
