// FILE: app/api/admin/invoices/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin"; // ✅ FIXED

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("Invoice")
    .select("*, User(email), License(productName)")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
