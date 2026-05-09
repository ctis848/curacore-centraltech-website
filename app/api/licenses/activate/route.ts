import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  try {
    const { reference, plan, quantity, email, fullName } = await req.json();

    if (!reference || !email || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
      }
    );

    // 1️⃣ Get the user by email
    const { data: userData } = await supabase
      .from("profiles")
      .select("id, company_id")
      .eq("email", email)
      .single();

    if (!userData || !userData.company_id) {
      return NextResponse.json(
        { error: "User or company not found." },
        { status: 404 }
      );
    }

    const companyId = userData.company_id;

    // 2️⃣ Get the company record
    const { data: company } = await supabase
      .from("companies")
      .select("annual_fee, base_license_count")
      .eq("id", companyId)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: "Company not found." },
        { status: 404 }
      );
    }

    const currentAnnualFee = Number(company.annual_fee) || 0;
    const currentLicenses = Number(company.base_license_count) || 0;

    // 3️⃣ Apply your business rule
    // Enterprise Plan = ₦550,000
    // 20% of ₦550,000 = ₦110,000
    // New annual fee = currentAnnualFee + (110,000 × quantity)

    const ENTERPRISE_PLAN_PRICE = 550000;
    const EXTRA_PER_LICENSE = ENTERPRISE_PLAN_PRICE * 0.2; // ₦110,000

    const extraFee = EXTRA_PER_LICENSE * quantity;
    const newAnnualFee = currentAnnualFee + extraFee;
    const newLicenseCount = currentLicenses + quantity;

    // 4️⃣ Update company record
    await supabase
      .from("companies")
      .update({
        annual_fee: newAnnualFee,
        base_license_count: newLicenseCount,
      })
      .eq("id", companyId);

    // 5️⃣ Save license purchase history (optional)
    await supabase.from("license_purchases").insert({
      company_id: companyId,
      quantity,
      amount_paid: extraFee,
      reference,
      purchased_by: fullName,
    });

    return NextResponse.json({
      success: true,
      message: "License activated and annual fee updated.",
      newAnnualFee,
      newLicenseCount,
    });

  } catch (err) {
    console.error("Activation error:", err);
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }
}
