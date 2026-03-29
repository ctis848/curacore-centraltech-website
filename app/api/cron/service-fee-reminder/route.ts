import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/sendEmail";

export async function GET() {
  try {
    const supabase = supabaseServer();

    // Fetch licenses that have unpaid service fees
    const { data: licenses, error } = await supabase
      .from("licenses")
      .select("id, renewal_due_date, service_fee_paid, user_id")
      .eq("service_fee_paid", false);

    if (error || !licenses) {
      return NextResponse.json(
        { error: "Failed to load licenses" },
        { status: 500 }
      );
    }

    const today = new Date();

    for (const license of licenses) {
      if (!license.renewal_due_date) continue;

      const due = new Date(license.renewal_due_date);
      const diff = Math.ceil(
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff === 7) {
        // Fetch user email separately
        const { data: userData } = await supabase
          .from("auth.users")
          .select("email")
          .eq("id", license.user_id)
          .single();

        const email = userData?.email ?? "";
        if (!email) continue;

        await sendEmail({
          to: email,
          subject: "Your Annual Service Fee is Due Soon",
          html: `Your 20% annual service fee for license ${license.id} is due in 7 days.`,
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
