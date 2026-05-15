// FILE: app/api/admin/invoices/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Fetch invoices WITHOUT joins first
    const { data: invoices, error } = await supabaseAdmin
      .from("Invoice")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Invoice fetch error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // OPTIONAL: Fetch related User + License data manually
    const enriched = await Promise.all(
      invoices.map(async (inv) => {
        const [userRes, licenseRes] = await Promise.all([
          supabaseAdmin.from("User").select("email").eq("id", inv.userId).single(),
          supabaseAdmin.from("License").select("productName").eq("id", inv.licenseId).single(),
        ]);

        return {
          ...inv,
          userEmail: userRes.data?.email ?? null,
          productName: licenseRes.data?.productName ?? null,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (err: any) {
    console.error("Invoice API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
