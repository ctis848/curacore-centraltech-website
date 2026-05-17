import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    // Get the logged‑in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch payment history
    const { data, error } = await supabase
      .from("Payment")
      .select("*")
      .eq("userid", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payment history error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
