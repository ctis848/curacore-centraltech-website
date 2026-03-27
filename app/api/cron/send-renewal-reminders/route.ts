import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/sendEmail";
import { LicenseWithUser } from "@/app/types/licenseWithUser";

export async function GET() {
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

  if (error || !licenses) {
    return NextResponse.json(
      { error: "Failed to load licenses" },
      { status: 500 }
    );
  }

  const today = new Date();

  for (const license of licenses as unknown as LicenseWithUser[]) {
    if (!license.renewal_due_date) continue;

    const due = new Date(license.renewal_due_date);
    const diff = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 7) {
      await sendEmail({
        to: license.user?.email ?? "",
        subject: "Your Annual Service Fee is Due Soon",
        html: `Your 20% annual service fee for license ${license.id} is due in 7 days.`,
      });
    }
  }

  return NextResponse.json({ success: true });
}
