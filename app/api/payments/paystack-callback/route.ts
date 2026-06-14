export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function POST(request: Request) {
  try {
    if (!APP_URL) {
      return NextResponse.json(
        { success: false, error: "NEXT_PUBLIC_APP_URL is missing" },
        { status: 500 }
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "PAYSTACK_SECRET_KEY is missing" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const supabase = supabaseServer();

    // -------------------------------
    // Extract fields
    // -------------------------------
    const email = String(body?.email || "").trim();
    const amount = Number(body?.amount || 0);
    const type = String(body?.type || "").trim();
    const invoiceId = body?.invoiceId || null;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Payment type is required" },
        { status: 400 }
      );
    }

    // -------------------------------
    // Build metadata
    // -------------------------------
    let metadata: any = {
      email,
      type,
      description: "",
    };

    // -------------------------------
    // INVOICE PAYMENT
    // -------------------------------
    if (type === "INVOICE_PAYMENT" && invoiceId) {
      const { data: invoice, error: invoiceError } = await supabase
        .from("Invoice")
        .select("*")
        .eq("id", invoiceId)
        .single();

      if (invoiceError || !invoice) {
        return NextResponse.json(
          { success: false, error: "Invoice not found" },
          { status: 404 }
        );
      }

      metadata = {
        ...metadata,
        invoiceId,
        description: "Invoice Payment",
      };
    }

    // -------------------------------
    // NEW LICENSE PURCHASE
    // -------------------------------
    if (type === "NEW_LICENSE_PURCHASE") {
      const { companyName, plan, quantity, annualFee, clientId, licenseId } =
        body;

      if (!companyName) {
        return NextResponse.json(
          { success: false, error: "Company name is required" },
          { status: 400 }
        );
      }

      metadata = {
        ...metadata,
        description: "New License Purchase",
        companyName,
        plan,
        quantity,
        annualFee,
        clientId,
        licenseId,
      };
    }

    // -------------------------------
    // ANNUAL RENEWAL
    // -------------------------------
    if (type === "ANNUAL_RENEWAL") {
      const { companyName, plan, quantity, clientId, licenseId } = body;

      metadata = {
        ...metadata,
        description: "Annual Subscription Renewal",
        companyName,
        plan,
        quantity,
        clientId,
        licenseId,
      };
    }

    // -------------------------------
    // Generate reference
    // -------------------------------
    const reference = `CC-${Date.now()}-${Math.floor(
      Math.random() * 100000
    )}`;

    // -------------------------------
    // Initialize Paystack
    // -------------------------------
    const initRes = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        currency: "NGN",
        reference,
        metadata,
        callback_url: `${APP_URL}/payments/status?reference=${reference}`,
      }),
    });

    const raw = await initRes.text();
    const trimmed = raw.trim();

    if (trimmed.startsWith("<")) {
      return NextResponse.json(
        { success: false, error: "Paystack returned HTML. Try again." },
        { status: 400 }
      );
    }

    let data;
    try {
      data = JSON.parse(trimmed);
    } catch {
      return NextResponse.json(
        { success: false, error: "Paystack returned invalid JSON" },
        { status: 400 }
      );
    }

    if (!initRes.ok || !data.status) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to initialize Paystack" },
        { status: 400 }
      );
    }

    // -------------------------------
    // Send email notification
    // -------------------------------
    await sendEmail({
      to: email,
      subject: "Payment Initiated",
      html: `
        <h2>Your payment is being processed</h2>
        <p>Description: <strong>${metadata.description}</strong></p>
        <p>Amount: <strong>₦${amount.toLocaleString()}</strong></p>
        <p>Reference: <strong>${reference}</strong></p>
      `,
    });

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("🔥 PAYSTACK CALLBACK ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Server error initializing payment" },
      { status: 500 }
    );
  }
}
