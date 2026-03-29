// FILE: app/api/admin/revenue/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = supabaseServer();

  const {
    data: { user: admin },
  } = await supabase.auth.getUser();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("payments")
    .select("amount, client_id, clients(email, name)")
    .eq("status", "paid");

  if (error) {
    return NextResponse.json(
      { error: "Failed to load revenue" },
      { status: 500 }
    );
  }

  const byClient: Record<
    string,
    { client_id: string; name: string | null; email: string | null; total: number }
  > = {};

  for (const p of data ?? []) {
    const key = p.client_id;

    if (!byClient[key]) {
      byClient[key] = {
        client_id: key,
        name: p.clients?.[0]?.name ?? null,
        email: p.clients?.[0]?.email ?? null,
        total: 0,
      };
    }

    byClient[key].total += Number(p.amount);
  }

  return NextResponse.json({ revenue_by_client: Object.values(byClient) });
}
