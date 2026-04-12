import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("id, amount, currency, status, created_at, product_name")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("REVENUE INSIGHTS ERROR:", error);
      return NextResponse.json(
        { error: "Failed to load revenue insights" },
        { status: 500 }
      );
    }

    const totalRevenue = data
      .filter((p: any) => p.status === "SUCCESS")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const byProduct: Record<string, number> = {};
    data
      .filter((p: any) => p.status === "SUCCESS")
      .forEach((p: any) => {
        const key = p.product_name || "Unknown";
        byProduct[key] = (byProduct[key] || 0) + (p.amount || 0);
      });

    return NextResponse.json({
      totalRevenue,
      currency: data[0]?.currency || "NGN",
      byProduct,
      recentPayments: data.slice(0, 20),
    });
  } catch (err: any) {
    console.error("REVENUE INSIGHTS SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
