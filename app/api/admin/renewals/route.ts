import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);
    const search = searchParams.get("search")?.toLowerCase() || "";

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // ⭐ TODAY
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];

    // ⭐ 3 DAYS
    const threeDays = new Date();
    threeDays.setDate(today.getDate() + 3);
    const threeDaysISO = threeDays.toISOString().split("T")[0];

    // ⭐ 7 DAYS
    const sevenDays = new Date();
    sevenDays.setDate(today.getDate() + 7);
    const sevenDaysISO = sevenDays.toISOString().split("T")[0];

    // ⭐ 1 MONTH (30 days)
    const oneMonth = new Date();
    oneMonth.setDate(today.getDate() + 30);
    const oneMonthISO = oneMonth.toISOString().split("T")[0];

    // ⭐ BASE QUERY
    let query = supabaseAdmin
      .from("companies")
      .select("*", { count: "exact" })
      .not("renewal_date", "is", null)
      .gte("renewal_date", todayISO) // future only
      .lte("renewal_date", oneMonthISO); // within 30 days max

    // ⭐ SEARCH FILTER
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // ⭐ ORDER BY UPCOMING FIRST
    query = query.order("renewal_date", { ascending: true });

    // ⭐ PAGINATION
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Renewals fetch error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // ⭐ FILTER EXACTLY THE 3 CONDITIONS
    const filtered = data.filter((company) => {
      const date = company.renewal_date;

      return (
        (date <= oneMonthISO && date >= todayISO) || // within 30 days
        (date <= sevenDaysISO && date >= todayISO) || // within 7 days
        (date <= threeDaysISO && date >= todayISO) // within 3 days
      );
    });

    return NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
      page,
      pageSize,
    });

  } catch (err: any) {
    console.error("Renewals API error:", err);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
