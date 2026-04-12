import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("validation_logs")
      .select("country, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GEO MAP ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load geo map data" },
        { status: 500 }
      );
    }

    const countryStats: Record<string, { total: number; failed: number }> = {};

    data.forEach((log: any) => {
      const country = log.country || "Unknown";
      if (!countryStats[country]) {
        countryStats[country] = { total: 0, failed: 0 };
      }
      countryStats[country].total++;
      if (log.status === "FAILED") {
        countryStats[country].failed++;
      }
    });

    return NextResponse.json({ countryStats });
  } catch (err: any) {
    console.error("GEO MAP SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
