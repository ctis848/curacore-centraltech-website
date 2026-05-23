import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const { data, error } = await supabase.storage
    .from("invoices")
    .list("", { limit: 200 });

  if (error) return NextResponse.json({ invoices: [] }, { status: 500 });

  const invoices = data.map((f) => ({
    path: supabase.storage.from("invoices").getPublicUrl(f.name).data.publicUrl,
    created_at: f.created_at,
  }));

  return NextResponse.json({ invoices });
}
