import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await admin
    .from("Invoice")
    .select("*, User(email), License(productName)")
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
