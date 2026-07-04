// PATH: app/api/admin/payments/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // 1️⃣ Fetch all payments (correct table name)
    const { data: payments, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payment fetch error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // 2️⃣ Fetch all users once (faster than querying per payment)
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
    const users = usersList?.users ?? [];

    // 3️⃣ Enrich each payment
    const enriched = await Promise.all(
      payments.map(async (p) => {
        // Match user by userid
        const user = users.find((u) => u.id === p.userid);

        // Fetch invoice details
        const invoiceRes = p.invoice_id
          ? await supabaseAdmin
              .from("Invoice")
              .select("id, totalAmount, createdAt, status")
              .eq("id", p.invoice_id)
              .single()
          : { data: null };

        // Fetch timeline count
        const timelineRes = await supabaseAdmin
          .from("payment_timeline")
          .select("id", { count: "exact", head: true })
          .eq("payment_id", p.id);

        return {
          ...p,
          userEmail: user?.email ?? null,
          userCreatedAt: user?.created_at ?? null,
          invoice: invoiceRes.data ?? null,
          timelineCount: timelineRes.count ?? 0,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (err: any) {
    console.error("Payments API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
