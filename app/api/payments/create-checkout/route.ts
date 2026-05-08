export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/brevo";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const invoiceId = body?.invoiceId as string | undefined;
    const amount = body?.amount as number | undefined;
    const type = body?.type as
      | "ANNUAL_RENEWAL"
      | "NEW_LICENSE_PURCHASE"
      | undefined;

    // NEW PURCHASE = no invoiceId AND type === "NEW_LICENSE_PURCHASE"
    const isNewPurchase = !invoiceId && type === "NEW_LICENSE_PURCHASE";

    // Validate type
    if (!isNewPurchase && !invoiceId && type !== "ANNUAL_RENEWAL") {
      return NextResponse.json(
        { error: "invoiceId or valid type is required" },
        { status: 400 }
      );
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "PAYSTACK_SECRET_KEY is not configured" },
        { status: 500 }
      );
    }

    const supabase = supabaseServer();

    // Validate user session
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData.user;

    // Allow UNAUTHENTICATED users ONLY for NEW LICENSE PURCHASES
    if (!user && !isNewPurchase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Email: prefer Supabase user email, fallback to body.email
    let email: string | undefined = user?.email || body.email;

    let finalAmount = amount;
    let metadata: any = { userId: user?.id || null };

    // ----------------------------------------------------
    // INVOICE PAYMENT FLOW
    // ----------------------------------------------------
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

      if (invoice.userId !== user?.id) {
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
      finalAmount = invoice.amount;

      metadata = {
        invoiceId: invoice.id,
        userId: user?.id || null,
        description: "Invoice Payment",
        type: "INVOICE_PAYMENT",
      };
    }

    // ----------------------------------------------------
    // NEW LICENSE PURCHASE FLOW
    // ----------------------------------------------------
    if (isNewPurchase) {
      if (!amount || isNaN(amount)) {
        return NextResponse.json(
          { error: "Amount is required for new license purchase" },
          { status: 400 }
        );
      }

      finalAmount = Math.round(amount);

      metadata = {
        userId: user?.id || null,
        description: "New License Purchase",
        type: "NEW_LICENSE_PURCHASE",
        plan: body.plan,
        quantity: body.quantity,
        fullName: body.fullName,
        email: body.email,
        annualFee: body.annualFee,
      };
    }

    // ----------------------------------------------------
    // ANNUAL SUBSCRIPTION RENEWAL FLOW
    // ----------------------------------------------------
    if (type === "ANNUAL_RENEWAL" && !invoiceId && !isNewPurchase) {
      if (!amount || isNaN(amount)) {
        return NextResponse.json(
          { error: "Amount is required for annual renewal" },
          { status: 400 }
        );
      }

      finalAmount = Math.round(amount);

      metadata = {
        userId: user?.id || null,
        description: "Annual Subscription Renewal",
        type: "ANNUAL_RENEWAL",
      };
    }

    // ----------------------------------------------------
    // Generate unique reference
    // ----------------------------------------------------
    const reference = `CC-${Date.now()}-${Math.floor(
      Math.random() * 100000
    )}`;

    // ----------------------------------------------------
    // Initialize Paystack transaction
    // ----------------------------------------------------
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: (finalAmount ?? 0) * 100,
        currency: "NGN",
        reference,
        metadata,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || "Failed to initialize Paystack transaction" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------
    // Optional: notify user
    // ----------------------------------------------------
    if (email) {
      await sendEmail({
        to: email,
        subject: "Payment Initiated",
        html: `
          <h2>Your payment is being processed</h2>
          <p>Description: <strong>${metadata.description}</strong></p>
          <p>Amount: <strong>₦${(finalAmount ?? 0).toLocaleString()}</strong></p>
          <p>Reference: <strong>${reference}</strong></p>
        `,
      });
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
    });
  } catch (error) {
    console.error("Paystack error:", error);
    return NextResponse.json(
      { error: "Something went wrong initializing payment" },
      { status: 500 }
    );
  }
}
