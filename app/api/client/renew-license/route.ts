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
      .select("id, name, annual_price, license_count")
      .eq("id", companyId)
      .single();

    if (companyErr || !company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // ⭐ FIX: users is ALWAYS an array → so we extract [0]
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
          amount: company.annual_price * 100,
          metadata: {
            type: "ANNUAL_RENEWAL",
            companyId: company.id,
            companyName: company.name,
            licenseCount: company.license_count,
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
    });
  } catch (err: any) {
    console.error("Renew License API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
