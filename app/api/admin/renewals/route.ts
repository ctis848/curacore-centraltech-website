import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);

    const search = searchParams.get("search")?.toLowerCase() || "";
    const month = searchParams.get("month"); // e.g. "6"
    const year = searchParams.get("year");   // e.g. "2026"

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // ⭐ STEP 1 — BASE QUERY (NO PAGINATION YET)
    let query = supabaseAdmin
      .from("companies")
      .select("*", { count: "exact" })
      .not("renewal_date", "is", null);

    // ⭐ STEP 2 — SEARCH FILTER
    if (search) {
      const s = `%${search}%`;
      query = query.ilike("name", s);
    }

    // ⭐ STEP 3 — MONTH FILTER
    if (month) {
      const y = year || new Date().getFullYear();
      const m = Number(month);

      query = query
        .gte("renewal_date", `${y}-${String(m).padStart(2, "0")}-01`)
        .lt("renewal_date", `${y}-${String(m + 1).padStart(2, "0")}-01`);
    }

    // ⭐ STEP 4 — YEAR FILTER
    if (!month && year) {
      query = query
        .gte("renewal_date", `${year}-01-01`)
        .lte("renewal_date", `${year}-12-31`);
    }

    // ⭐ STEP 5 — ORDER BY RENEWAL DATE
    query = query.order("renewal_date", { ascending: true });

    // ⭐ STEP 6 — APPLY PAGINATION LAST
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Companies fetch error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      total: count || 0,
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
