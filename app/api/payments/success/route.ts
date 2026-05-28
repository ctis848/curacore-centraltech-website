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

    if (!companyId || !companyName || !companyEmail || !amount || !planName) {
      console.log("\x1b[31m[ERROR] Missing required fields\x1b[0m");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // 1️⃣ Generate invoice number
    const invoiceNumber = generateInvoiceNumber(companyId);
    const createdDate = new Date().toISOString().split("T")[0];

    console.log(
      `\x1b[36m[INFO] Generating Invoice: ${invoiceNumber} for ${companyName}\x1b[0m`
    );

    // 2️⃣ Save invoice to database
    const { error: invoiceError } = await supabase.from("invoices").insert({
      company_id: companyId,
      invoice_number: invoiceNumber,
      amount,
      plan_name: planName,
      due_date: createdDate,
    });

    if (invoiceError) {
      console.log("\x1b[31m[DB ERROR] Failed to save invoice\x1b[0m", invoiceError);
      return NextResponse.json(
        { success: false, error: "Failed to save invoice" },
        { status: 500 }
      );
    }

    console.log("\x1b[32m[SUCCESS] Invoice saved to database\x1b[0m");

    // 3️⃣ Generate PDF invoice
    const pdfResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/invoice/generate`,
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

    if (!pdfResponse.ok) {
      console.log("\x1b[31m[PDF ERROR] Failed to generate invoice PDF\x1b[0m");
      return NextResponse.json(
        { success: false, error: "Failed to generate PDF" },
        { status: 500 }
      );
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    console.log("\x1b[32m[SUCCESS] PDF invoice generated\x1b[0m");

    // 4️⃣ Email invoice to client + admin
    const brevoKey = process.env.BREVO_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

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
        <p><strong>Amount Paid:</strong> ₦${amount}</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p>Thank you for choosing CentralCore EMR.</p>
      `,
      attachment: [
        {
          name: `invoice-${invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer).toString("base64"),
        },
      ],
    };

    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.log("\x1b[31m[EMAIL ERROR] Brevo failed\x1b[0m", errorText);
      return NextResponse.json(
        { success: false, error: "Failed to send invoice email" },
        { status: 500 }
      );
    }

    console.log("\x1b[32m[SUCCESS] Invoice emailed to client & admin\x1b[0m");

    // 5️⃣ Return success
    return NextResponse.json({
      success: true,
      message: "Payment processed, invoice generated and emailed successfully",
      invoiceNumber,
    });
  } catch (err: any) {
    console.log("\x1b[31m[SERVER ERROR]\x1b[0m", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
