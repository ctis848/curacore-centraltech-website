import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { differenceInDays } from "date-fns";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // -----------------------------------------------------
    // LOAD COMPANY
    // -----------------------------------------------------
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select(
        "id, name, renewal_date, annual_amount, email, portal_password, created_at"
      )
      .eq("id", id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({
        success: false,
        message: "Company not found",
      });
    }

    // -----------------------------------------------------
    // CALCULATE DAYS LEFT
    // -----------------------------------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const renewalDate = new Date(company.renewal_date);
    const daysLeft = differenceInDays(renewalDate, today);

    let renewalState = "Not in range";

    if (daysLeft < 0) renewalState = "Expired";
    else if (daysLeft <= 3) renewalState = "Due in 3 days";
    else if (daysLeft <= 7) renewalState = "Due in 7 days";
    else if (daysLeft <= 30) renewalState = "Due in 30 days";

    const canSendReminder = daysLeft >= 1 && daysLeft <= 30;

    // -----------------------------------------------------
    // LOAD REMINDER HISTORY
    // -----------------------------------------------------
    const { data: history } = await supabaseAdmin
      .from("renewal_reminder_history")
      .select("id, company_id, days_left, sent_at")
      .eq("company_id", id)
      .order("sent_at", { ascending: false });

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------
    return NextResponse.json({
      success: true,
      company: {
        ...company,
        daysLeft,
        renewalState,
        canSendReminder,
      },
      history: history || [],
    });
  } catch (err) {
    console.error("View company error:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
