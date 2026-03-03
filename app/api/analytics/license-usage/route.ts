import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { getUserAndRole } from "@/lib/auth/getUserAndRole";

export async function GET() {
  const { role } = await getUserAndRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("licenses")
    .select("active");

  if (error) return NextResponse.json([], { status: 500 });

  const total = data?.length ?? 0;
  const active = data?.filter((d) => d.active).length ?? 0;
  const inactive = total - active;

  return NextResponse.json([
    { label: "Total", value: total },
    { label: "Active", value: active },
    { label: "Inactive", value: inactive },
  ]);
}
