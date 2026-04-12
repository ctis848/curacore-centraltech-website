import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("id, name, email, phone, company")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CLIENT LIST ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load clients" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
