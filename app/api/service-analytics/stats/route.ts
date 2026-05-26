import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET() {
  try {
    const supabase = createAdminSupabase();

    // Total requests
    const { count: totalRequests } = await supabase
      .from("ServiceRequests")
      .select("*", { count: "exact", head: true });

    // Completed invoices
    const { count: paidInvoices } = await supabase
      .from("ServiceInvoices")
      .select("*", { count: "exact", head: true })
      .eq("paid", true);

    // Pending requests
    const { count: pendingRequests } = await supabase
      .from("ServiceRequests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    return NextResponse.json(
      {
        totalRequests: totalRequests || 0,
        paidInvoices: paidInvoices || 0,
        pendingRequests: pendingRequests || 0,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("SERVER ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
