import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const APP_BASE_URL = process.env.APP_BASE_URL!;

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseServer();
    const body = await req.json();

    const { licenseId, clientId, companyName, plan, quantity } = body;

    if (!licenseId || !plan || !quantity) {
      return NextResponse.json(
        { error: "Missing licenseId, plan, or quantity" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // AUTHENTICATED USER
    // ----------------------------------------------------
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const email = user.email;
    if (!email) {
      return NextResponse.json(
        { error: "User email missing" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // CALCULATE ANNUAL RENEWAL FEE
    // ----------------------------------------------------
    let planPrice = 0;

    if (plan === "Starter") planPrice = 250000;
    if (plan === "Pro") planPrice = 350000;
    if (plan === "Enterprise") planPrice = 550000;

    const maintenanceFeePerLicense = 0.20 * planPrice;
    const annualRenewalAmount = maintenanceFeePerLicense * quantity;

    // ----------------------------------------------------
    // INITIALIZE PAYSTACK PAYMENT
    // ----------------------------------------------------
    const initRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: annualRenewalAmount * 100, // Paystack expects kobo
          currency: "NGN",
          callback_url: `${APP_BASE_URL}/payment/status?reference={reference}`,

          metadata: {
            type: "ANNUAL_RENEWAL",
            licenseId,
            userId: user.id,
            clientId: clientId ?? null,
            companyName: companyName ?? "",
            plan,
            quantity,
            maintenanceFeePerLicense,
            annualRenewalAmount,
          },
        }),
      }
    );

    const initData = await initRes.json();

    if (!initData.status) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorization_url: initData.data.authorization_url,
      reference: initData.data.reference,
      annualRenewalAmount,
    });
  } catch (err) {
    console.error("RENEW-ANNUAL INITIALIZE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
