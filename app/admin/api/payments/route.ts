import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/client";

// RBAC: Only allow admin users
async function requireAdmin() {
  const supabase = createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { allowed: false, reason: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { allowed: false, reason: "Forbidden" };
  }

  return { allowed: true };
}

export async function GET(req: Request) {
  try {
    // RBAC check
    const auth = await requireAdmin();
    if (!auth.allowed) {
      return NextResponse.json(
        { error: auth.reason },
        { status: auth.reason === "Forbidden" ? 403 : 401 }
      );
    }

    const supabase = createSupabaseClient();

    // Extract query params
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const sort = searchParams.get("sort") ?? "createdAt";
    const order = searchParams.get("order") ?? "desc";
    const status = searchParams.get("status") ?? "";
    const client = searchParams.get("client") ?? "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("payments")
      .select("*", { count: "exact" })
      .order(sort, { ascending: order === "asc" })
      .range(from, to);

    // Filtering
    if (status) query = query.eq("status", status);
    if (client) query = query.ilike("client", `%${client}%`);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      page,
      limit,
      total: count ?? 0,
      pages: Math.ceil((count ?? 0) / limit),
      data: data ?? [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
