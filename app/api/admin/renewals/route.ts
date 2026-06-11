import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { differenceInDays } from "date-fns";

export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .select("*")
      .not("renewal_date", "is", null);

    if (error) {
      console.error("Renewals fetch error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const today = new Date();

    const expired: any[] = [];
    const dueIn3: any[] = [];
    const dueIn7: any[] = [];
    const dueIn30: any[] = [];

    for (const company of data) {
      const renewalDate = new Date(company.renewal_date);
      const daysLeft = differenceInDays(renewalDate, today);

      if (daysLeft < 0) {
        expired.push(company);
      } else if (daysLeft <= 3) {
        dueIn3.push(company);
      } else if (daysLeft <= 7) {
        dueIn7.push(company);
      } else if (daysLeft <= 30) {
        dueIn30.push(company);
      }
    }

    return NextResponse.json({
      success: true,
      expired,
      dueIn3,
      dueIn7,
      dueIn30,
      total: data.length,
    });
  } catch (err: any) {
    console.error("Renewals API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
