import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Fetch all licenses
    const { data: licenses, error } = await supabase
      .from("licenses")
      .select("id, user_id, auto_renew, renewal_due_date, service_fee_paid");

    if (error) {
      return NextResponse.json(
        { error: "Failed to load licenses" },
        { status: 500 }
      );
    }

    const today = new Date();

    for (const license of licenses || []) {
      if (!license.auto_renew || !license.renewal_due_date) continue;

      const due = new Date(license.renewal_due_date);
      const diff = Math.ceil(
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If renewal is due today and fee not paid → revoke auto-renew
      if (diff === 0 && !license.service_fee_paid) {
        // Log renewal history
        await supabase.from("license_renewal_history").insert({
          license_id: license.id,
          user_id: license.user_id,
          action: "auto_revoked",
          metadata: {},
        });

        // Disable license
        await supabase
          .from("licenses")
          .update({ active: false }) // adjust if your schema uses a different field
          .eq("id", license.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Auto-renewal cron error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
