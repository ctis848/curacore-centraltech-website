// app/api/whoami/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.auth.getUser();
  return NextResponse.json({ data, error });
}
