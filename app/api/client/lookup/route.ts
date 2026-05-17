import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = supabaseServer();

    const { data: client, error } = await supabase
      .from("Clients")
      .select("companyName, email, totalLicenses")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      exists: !!client,
      companyName: client?.companyName || "",
      email: client?.email || "",
      totalLicenses: client?.totalLicenses || 0,
    });

  } catch (err) {
    console.error("Lookup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
