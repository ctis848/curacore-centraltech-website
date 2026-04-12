import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET() {
  try {
    const [{ count: totalClients }, { count: totalLicenses }, { count: activeLicenses }, { data: revenueData }] =
      await Promise.all([
        supabaseAdmin.from("clients").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("licenses").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("licenses").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
        supabaseAdmin.from("payments").select("amount"),
      ]);

    const totalRevenue = revenueData?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return NextResponse.json({
      totalClients,
      totalLicenses,
      activeLicenses,
      totalRevenue,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load dashboard metrics", details: err.message },
      { status: 500 }
    );
  }
}
