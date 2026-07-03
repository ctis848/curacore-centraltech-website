import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Missing company ID" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Load company billing info
    const { data: company, error: companyErr } = await supabase
      .from("companies")
      .select("id, name, license_plan_price, license_count")
      .eq("id", companyId)
      .single();

    if (companyErr || !company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // ⭐ Annual Maintenance Fee Per License = 20% × plan price
    const maintenanceFeePerLicense = 0.20 * company.license_plan_price;

    // ⭐ Annual Renewal = maintenanceFeePerLicense × license_count
    const annualRenewalAmount = maintenanceFeePerLicense * company.license_count;

    // Load company owner email
    const { data: owner, error: ownerErr } = await supabase
      .from("user_companies")
      .select("users(email)")
      .eq("company_id", companyId)
      .single();

    const customerEmail = owner?.users?.[0]?.email;

    if (ownerErr || !customerEmail) {
      return NextResponse.json(
        { success: false, error: "Company owner email not found" },
        { status: 400 }
      );
    }

    // Create Paystack payment
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: annualRenewalAmount * 100, // Paystack expects amount in kobo
          metadata: {
            type: "ANNUAL_RENEWAL",
            companyId: company.id,
            companyName: company.name,
            licenseCount: company.license_count,
            maintenanceFeePerLicense,
            annualRenewalAmount,
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/client/renew-annual?company_id=${company.id}`,
        }),
      }
    );

    const paystackJson = await paystackRes.json();

    if (!paystackJson.status) {
      return NextResponse.json(
        { success: false, error: paystackJson.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackJson.data.authorization_url,
      annualRenewalAmount,
    });
  } catch (err: any) {
    console.error("Renew License API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
