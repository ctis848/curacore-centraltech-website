import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "activation_date.desc";

    const [sortField, sortOrder] = sort.split(".");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("licenses")
      .select("*", { count: "exact" })
      .order(sortField, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `license_key.ilike.%${search}%,machine_hash.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { items: [], total: 0, page, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: data ?? [],
      total: count ?? 0,
      page,
    });
  } catch (err: any) {
    return NextResponse.json(
      { items: [], total: 0, page: 1, error: err.message },
      { status: 500 }
    );
  }
}
