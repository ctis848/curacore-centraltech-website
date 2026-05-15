import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { user_id, company_name } = await req.json();

    if (!user_id || !company_name) {
      return NextResponse.json({ success: false, message: "Missing fields" });
    }

    // 1. Check if company exists
    const { data: existingCompany } = await supabaseAdmin
      .from("companies")
      .select("*")
      .ilike("name", company_name.trim())
      .single();

    let companyId;

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      // 2. Create new company
      const { data: newCompany } = await supabaseAdmin
        .from("companies")
        .insert({
          name: company_name.trim(),
          annual_price: 0,
          renewal_date: null,
          license_count: 0,
        })
        .select()
        .single();

      companyId = newCompany.id;
    }

    // 3. Link user to company
    await supabaseAdmin.from("user_companies").insert({
      user_id,
      company_id: companyId,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
