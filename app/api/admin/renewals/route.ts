import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 30; // Faster refresh for dashboards

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(100, Number(searchParams.get("pageSize") || 10)); 
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const status = searchParams.get("status") || ""; // NEW: filter by renewal status
    const sort = searchParams.get("sort") || "renewal_date"; // NEW: dynamic sorting
    const direction = searchParams.get("direction") === "desc" ? "desc" : "asc";

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("companies")
      .select("*", { count: "exact" })
      .not("renewal_date", "is", null)
      .order(sort, { ascending: direction === "asc" })
      .range(from, to);

    // 🔍 Search by name or email
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // 🔥 Filter by renewal status
    if (status === "expired") {
      query = query.lt("renewal_date", new Date().toISOString());
    } else if (status === "active") {
      query = query.gte("renewal_date", new Date().toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 }
    );
  }
}
