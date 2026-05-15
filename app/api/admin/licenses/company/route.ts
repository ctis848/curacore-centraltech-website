import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const { data } = await supabaseAdmin
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  return NextResponse.json(data);
}
