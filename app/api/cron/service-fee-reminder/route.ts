export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = supabaseServer();

    const { data: licenses, error } = await supabase
      .from("licenses")
      .select("id, renewal_due_date, service_fee_paid, user_id")
      .eq("service_fee_paid", false);

    if (error || !licenses) {
      return NextResponse.json({ error: "Failed to load licenses" }, { status: 500 });
    }

    const today = new Date();

    for (const license of licenses) {
      if (!license.renewal_due_date) continue;

      const due = new Date(license.renewal_due_date);
      const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);

      if (diff === 7) {
        const { data: userData } = await supabase
          .from("auth.users")
          .select("email")
          .eq("id", license.user_id)
          .single();

        const email = userData?.email;
        if (!email) continue;

        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/annual-reminder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: "Customer",
            companyEmail: email,
            contactName: "Customer",
            dueDate: license.renewal_due_date,
            planName: "Annual Service Fee",
            amountDue: 0,
            paymentLink: `${process.env.NEXT_PUBLIC_SITE_URL}/pay/service-fee/${license.id}`,
            type: "7days",
          }),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Service fee reminder error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
