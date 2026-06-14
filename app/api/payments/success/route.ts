export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { generateInvoiceNumber } from "@/lib/utils/invoiceNumber";

export async function POST(req: Request) {
  try {
    const {
      companyId,
      companyName,
      companyEmail,
      amount,
      planName,
    } = await req.json();

    // -------------------------------
    // VALIDATION
    // -------------------------------
    if (!companyId || !companyName || !companyEmail || !amount || !planName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // -------------------------------
    // 1️⃣ Generate invoice number
    // -------------------------------
    const invoiceNumber = generateInvoiceNumber(companyId);
    const createdDate = new Date().toISOString().split("T")[0];

    console.log(`[INFO] Creating Invoice ${invoiceNumber} for ${companyName}`);

    // -------------------------------
    // 2️⃣ Save invoice to database
    // -------------------------------
    const { error: invoiceError } = await supabase.from("invoices").insert({
      company_id: companyId,
      invoice_number: invoiceNumber,
      amount,
      plan_name: planName,
      status: "PAID",
      created_at: new Date().toISOString(),
      due_date: createdDate,
    });

    if (invoiceError) {
      console.error("[DB ERROR] Failed to save invoice", invoiceError);
      return NextResponse.json(
        { success: false, error: "Failed to save invoice" },
        { status: 500 }
      );
    }

    console.log("[SUCCESS] Invoice saved");

    // -------------------------------
    // 3️⃣ Generate PDF invoice
    // -------------------------------
    const pdfRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/invoice/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          companyName,
          companyEmail,
          amount,
          planName,
          createdDate,
          dueDate: createdDate,
        }),
      }
    );

    if (!pdfRes.ok) {
      console.error("[PDF ERROR] Failed to generate invoice PDF");
      return NextResponse.json(
        { success: false, error: "Failed to generate invoice PDF" },
        { status: 500 }
      );
    }

    const pdfBuffer = await pdfRes.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    console.log("[SUCCESS] PDF generated");

    // -------------------------------
    // 4️⃣ Email invoice to client + admin
    // -------------------------------
    const brevoKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (!brevoKey || !notifyEmail) {
      return NextResponse.json(
        { success: false, error: "Email configuration missing" },
        { status: 500 }
      );
    }

    const emailPayload = {
      sender: { name: "CentralCore EMR Billing", email: notifyEmail },
      to: [{ email: companyEmail }],
      cc: [{ email: notifyEmail }],
      subject: `Invoice ${invoiceNumber} – CentralCore EMR Subscription`,
      htmlContent: `
        <h2 style="color:#0d9488;">CentralCore EMR – Payment Receipt</h2>
        <p>Hello <strong>${companyName}</strong>,</p>
        <p>Your payment was successful. Attached is your invoice.</p>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p>Thank you for choosing CentralCore EMR.</p>
      `,
      attachment: [
        {
          name: `invoice-${invoiceNumber}.pdf`,
          content: pdfBase64,
        },
      ],
    };

    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error("[EMAIL ERROR] Brevo failed", errorText);
      return NextResponse.json(
        { success: false, error: "Failed to send invoice email" },
        { status: 500 }
      );
    }

    console.log("[SUCCESS] Invoice emailed");

    // -------------------------------
    // 5️⃣ Return success
    // -------------------------------
    return NextResponse.json({
      success: true,
      message: "Payment processed, invoice generated and emailed successfully",
      invoiceNumber,
    });
  } catch (err: any) {
    console.error("[SERVER ERROR]", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
