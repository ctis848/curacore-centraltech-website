import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For now, just return JSON as a placeholder.
  // You can plug in a PDF library (pdfkit, @react-pdf/renderer) here.
  return NextResponse.json({ items: data ?? [] });
}
