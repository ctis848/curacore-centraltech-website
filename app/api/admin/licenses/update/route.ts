import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { company_id, adjust } = await req.json();

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("license_count")
    .eq("id", company_id)
    .single();

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404 }
    );
  }

  const newCount = company.license_count + adjust;
  const newAnnualFee = newCount * 0.20;

  await supabaseAdmin
    .from("companies")
    .update({
      license_count: newCount,
      annual_price: newAnnualFee,
      updated_at: new Date().toISOString(),
    })
    .eq("id", company_id);

  return NextResponse.json({ success: true });
}
