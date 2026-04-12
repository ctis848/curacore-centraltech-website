import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("validation_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("VALIDATION LOGS ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load validation logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: data });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
