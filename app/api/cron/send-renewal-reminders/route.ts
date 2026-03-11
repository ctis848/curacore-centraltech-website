import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { sendEmail } from "@/app/lib/sendEmail";
import { LicenseWithUser } from "@/app/types/licenseWithUser";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Fetch licenses with unpaid service fee + user email
  const { data: licenses, error } = await supabase
    .from("licenses")
    .select(`
      id,
      renewal_due_date,
      service_fee_paid,
      user_id,
      user:auth.users(email)
    `)
    .eq("service_fee_paid", false);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const today = new Date();

  for (const license of (licenses as LicenseWithUser[]) || []) {
    if (!license.renewal_due_date) continue;

    const due = new Date(license.renewal_due_date);

    // Days until renewal
    const diff = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Send reminder exactly 7 days before due date
    if (diff === 7) {
      await sendEmail(
        license.user.email,
        "Your Annual Service Fee is Due Soon",
        `Your 20% annual service fee for license ${license.id} is due in 7 days. Please renew to avoid automatic revocation.`
      );
    }
  }

  return NextResponse.json({ success: true });
}
