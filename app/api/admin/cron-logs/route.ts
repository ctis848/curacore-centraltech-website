import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = supabaseServer();

  try {
    const { searchParams } = new URL(req.url);

    // -----------------------------------------------------
    // QUERY PARAMETERS
    // -----------------------------------------------------
    const status = searchParams.get("status") || "ALL";
    const jobName = searchParams.get("job_name") || "ALL";
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const offset = (page - 1) * limit;

    // -----------------------------------------------------
    // BASE QUERY
    // -----------------------------------------------------
    let query = supabase
      .from("cron_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // -----------------------------------------------------
    // FILTER: STATUS
    // -----------------------------------------------------
    if (status !== "ALL") {
      query = query.eq("status", status);
    }

    // -----------------------------------------------------
    // FILTER: JOB NAME
    // -----------------------------------------------------
    if (jobName !== "ALL") {
      query = query.eq("job_name", jobName);
    }

    // -----------------------------------------------------
    // FILTER: SEARCH (message + error)
    // -----------------------------------------------------
    if (search.trim()) {
      query = query.or(
        `message.ilike.%${search}%,error.ilike.%${search}%`
      );
    }

    // -----------------------------------------------------
    // FILTER: DATE RANGE
    // -----------------------------------------------------
    if (dateFrom) {
      query = query.gte("created_at", `${dateFrom}T00:00:00`);
    }

    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59`);
    }

    // -----------------------------------------------------
    // PAGINATION
    // -----------------------------------------------------
    query = query.range(offset, offset + limit - 1);

    // -----------------------------------------------------
    // EXECUTE QUERY
    // -----------------------------------------------------
    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
}
