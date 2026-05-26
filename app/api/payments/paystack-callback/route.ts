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
        { error: "NEXT_PUBLIC_APP_URL is missing" },
        { status: 500 }
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is missing" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const invoiceId = body?.invoiceId as string | undefined;
    const amount = Number(body?.amount);
    const type = body?.type as
      | "NEW_LICENSE_PURCHASE"
      | "ANNUAL_RENEWAL"
      | "INVOICE_PAYMENT"
      | undefined;

    const isNewPurchase = !invoiceId && type === "NEW_LICENSE_PURCHASE";

    const supabase = supabaseServer();
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user || null;

    // -------------------------------
    // EMAIL VALIDATION
    // -------------------------------
    let email: string | undefined = user?.email || body?.email;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // -------------------------------
    // AMOUNT VALIDATION
    // -------------------------------
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    let finalAmount = Math.round(amount);
    let metadata: any = {
      userId: user?.id || null,
      email,
    };

    // -------------------------------
    // INVOICE PAYMENT
    // -------------------------------
    if (invoiceId) {
      const { data: invoice, error: invoiceError } = await supabase
        .from("Invoice")
        .select("*")
        .eq("id", invoiceId)
        .single();

      if (invoiceError || !invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      if (invoice.userId && invoice.userId !== user?.id) {
        return NextResponse.json(
          { error: "You cannot pay another user's invoice" },
          { status: 403 }
        );
      }

      if (invoice.status === "PAID") {
        return NextResponse.json(
          { error: "Invoice already paid" },
          { status: 400 }
        );
      }

      email = invoice.email;
      finalAmount = Number(invoice.amount);

      metadata = {
        ...metadata,
        invoiceId: invoice.id,
        description: "Invoice Payment",
        type: "INVOICE_PAYMENT",
      };
    }

    // -------------------------------
    // NEW LICENSE PURCHASE
    // -------------------------------
    if (isNewPurchase) {
      const {
        companyName,
        plan,
        quantity,
        annualFee,
        clientId,
        licenseId,
      } = body;

      if (!companyName || !companyName.trim()) {
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 }
        );
      }

      metadata = {
        ...metadata,
        description: "New License Purchase",
        type: "NEW_LICENSE_PURCHASE",
        plan: plan ?? "",
        quantity: quantity ?? 1,
        companyName,
        annualFee: annualFee ?? null,
        clientId: clientId ?? null,
        licenseId: licenseId ?? null,
      };
    }

    // -------------------------------
    // ANNUAL RENEWAL
    // -------------------------------
    if (type === "ANNUAL_RENEWAL" && !invoiceId && !isNewPurchase) {
      const { licenseId, clientId, companyName, plan, quantity } = body;

      metadata = {
        ...metadata,
        description: "Annual Subscription Renewal",
        type: "ANNUAL_RENEWAL",
        licenseId: licenseId ?? null,
        clientId: clientId ?? null,
        companyName: companyName ?? "",
        plan: plan ?? "",
        quantity: quantity ?? 1,
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
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: finalAmount * 100,
        currency: "NGN",
        reference,
        metadata,
        callback_url: `${APP_URL}/payment/status?reference=${reference}`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || "Failed to initialize Paystack transaction" },
        { status: 400 }
      );
    }

    // -------------------------------
    // Optional: notify user
    // -------------------------------
    await sendEmail({
      to: email as string, // ⭐ FIXED TS ERROR
      subject: "Payment Initiated",
      html: `
        <h2>Your payment is being processed</h2>
        <p>Description: <strong>${metadata.description ?? "Payment"}</strong></p>
        <p>Amount: <strong>₦${finalAmount.toLocaleString()}</strong></p>
        <p>Reference: <strong>${reference}</strong></p>
      `,
    });

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference,
    });
  } catch (error) {
    console.error("Paystack callback init error:", error);
    return NextResponse.json(
      { error: "Something went wrong initializing payment" },
      { status: 500 }
    );
  }
}
