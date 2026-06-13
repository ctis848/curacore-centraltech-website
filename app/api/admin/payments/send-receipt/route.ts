import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import PDFDocument from "pdfkit";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

// Generate sequential invoice number like: INV-000001
async function generateNextInvoiceNumber() {
  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select("invoice_number")
    .not("invoice_number", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0 || !data[0].invoice_number) {
    return "INV-000001";
  }

  const last = data[0].invoice_number as string;
  const match = last.match(/INV-(\d+)/);
  if (!match) return "INV-000001";

  const num = parseInt(match[1], 10) + 1;
  return `INV-${num.toString().padStart(6, "0")}`;
}

// Generate PDF invoice as Base64 string
async function generateInvoicePdfBase64(args: {
  invoiceNumber: string;
  amount: number;
  currency: string | null;
  reference: string | null;
  createdAt: string;
  companyName: string | null;
  email: string | null;
  gateway: string | null;
  channel: string | null;
}) {
  const {
    invoiceNumber,
    amount,
    currency,
    reference,
    createdAt,
    companyName,
    email,
    gateway,
    channel,
  } = args;

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));
  const endPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // Header
  doc
    .image("https://ctistech.com/logo.png", 50, 40, { width: 80 })
    .fontSize(18)
    .text("Central Tech Information System (CTIS)", 150, 40)
    .fontSize(10)
    .text("17 Esther-Oshiyemi Street, Lagos, Nigeria", 150, 65)
    .text("+234 805 931 8564", 150, 80)
    .text("info@ctistech.com", 150, 95);

  doc.moveDown(2);

  // Invoice title + meta
  doc
    .fontSize(20)
    .text("INVOICE", { align: "right" })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .text(`Invoice Number: ${invoiceNumber}`, { align: "right" })
    .text(`Date: ${new Date(createdAt).toLocaleDateString()}`, {
      align: "right",
    })
    .moveDown(2);

  // Bill to
  doc
    .fontSize(12)
    .text("Bill To:", 50, 160)
    .moveDown(0.5)
    .fontSize(10)
    .text(companyName || "", 50)
    .text(email || "", 50)
    .moveDown(2);

  // Table header
  const tableTop = 230;
  doc
    .fontSize(11)
    .text("Description", 50, tableTop)
    .text("Amount", 400, tableTop, { width: 90, align: "right" });

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // Line item
  const itemTop = tableTop + 25;
  doc
    .fontSize(10)
    .text("EMR Subscription Renewal", 50, itemTop)
    .text(
      `${currency || "NGN"} ${Number(amount).toFixed(2)}`,
      400,
      itemTop,
      { width: 90, align: "right" }
    );

  // Total
  const totalTop = itemTop + 40;
  doc
    .fontSize(11)
    .text("Total", 50, totalTop)
    .text(
      `${currency || "NGN"} ${Number(amount).toFixed(2)}`,
      400,
      totalTop,
      { width: 90, align: "right" }
    );

  doc
    .moveTo(50, totalTop - 5)
    .lineTo(550, totalTop - 5)
    .stroke();

  // Payment info
  doc.moveDown(3);
  doc.fontSize(10).text("Payment Details:", 50).moveDown(0.5);
  doc
    .text(`Reference: ${reference || "-"}`)
    .text(`Gateway: ${gateway || "-"}`)
    .text(`Channel: ${channel || "-"}`);

  // Footer
  doc.moveDown(3);
  doc
    .fontSize(9)
    .fillColor("gray")
    .text(
      "Thank you for your payment. We remain committed to delivering reliable, innovative, and professional IT solutions to support your operations.",
      { align: "center" }
    );

  doc.end();

  const buffer = await endPromise;
  return buffer.toString("base64");
}

async function sendBrevoEmailWithAttachment(args: {
  toEmail: string;
  subject: string;
  html: string;
  attachmentBase64: string;
  attachmentName: string;
}) {
  const { toEmail, subject, html, attachmentBase64, attachmentName } = args;

  const payload = {
    sender: { name: "CentralCore Billing", email: NOTIFY_EMAIL },
    to: [{ email: toEmail }],
    subject,
    htmlContent: html,
    attachment: [
      {
        content: attachmentBase64,
        name: attachmentName,
      },
    ],
    trackOpens: true,
    trackClicks: true,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

export async function POST(req: Request) {
  try {
    const { paymentId, reference } = await req.json();

    if (!paymentId && !reference) {
      return NextResponse.json(
        { success: false, message: "paymentId or reference is required" },
        { status: 400 }
      );
    }

    // Fetch payment
    const { data: payment, error: payError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .match(
        paymentId ? { id: paymentId } : { reference: reference as string }
      )
      .single();

    if (payError || !payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    if (!payment.invoice_id) {
      return NextResponse.json(
        { success: false, message: "Payment has no linked invoice_id" },
        { status: 400 }
      );
    }

    // Fetch invoice
    const { data: invoice, error: invError } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", payment.invoice_id)
      .single();

    if (invError || !invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    // Ensure invoice_number exists (sequential)
    let invoiceNumber = invoice.invoice_number as string | null;
    if (!invoiceNumber) {
      invoiceNumber = await generateNextInvoiceNumber();
      await supabaseAdmin
        .from("invoices")
        .update({ invoice_number: invoiceNumber, status: "PAID" })
        .eq("id", invoice.id);
    } else {
      await supabaseAdmin
        .from("invoices")
        .update({ status: "PAID" })
        .eq("id", invoice.id);
    }

    // Fetch company (optional)
    let companyName: string | null = null;
    let companyEmail: string | null = null;

    if (invoice.company_id) {
      const { data: company } = await supabaseAdmin
        .from("companies")
        .select("name, email")
        .eq("id", invoice.company_id)
        .single();

      if (company) {
        companyName = company.name;
        companyEmail = company.email;
      }
    }

    const toEmail = payment.email || companyEmail || NOTIFY_EMAIL!;

    // Generate PDF
    const pdfBase64 = await generateInvoicePdfBase64({
      invoiceNumber,
      amount: Number(invoice.amount),
      currency: payment.currency || "NGN",
      reference: payment.reference,
      createdAt: invoice.created_at || payment.created_at,
      companyName,
      email: toEmail,
      gateway: payment.gateway,
      channel: payment.channel,
    });

    // Receipt email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

          <div style="background:#1e3a8a; padding:20px; text-align:center;">
            <img src="https://ctistech.com/logo.png" alt="CTIS Logo" style="width:120px; margin-bottom:10px;" />
            <h2 style="color:white; margin:0;">Payment Receipt</h2>
          </div>

          <div style="padding:25px; color:#333; line-height:1.6;">
            <p>Dear ${companyName || "Valued Client"},</p>

            <p>We have received your payment for your EMR subscription.</p>

            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Amount:</strong> ${payment.currency || "NGN"} ${Number(
      invoice.amount
    ).toFixed(2)}</p>
            <p><strong>Reference:</strong> ${payment.reference || "-"}</p>
            <p><strong>Gateway:</strong> ${payment.gateway || "-"}</p>
            <p><strong>Channel:</strong> ${payment.channel || "-"}</p>
            <p><strong>Date:</strong> ${new Date(
              invoice.created_at || payment.created_at
            ).toLocaleString()}</p>

            <p>A copy of your invoice has been attached to this email as a PDF document.</p>

            <p>Thank you for your continued trust in EMR. We remain committed to delivering reliable, innovative, and professional IT solutions to support your operations.</p>
          </div>

          <div style="background:#f0f0f0; padding:15px; text-align:center; font-size:13px; color:#555;">
            <p>Central Tech Information System (CTIS)</p>
            <p><a href="https://www.ctistech.com">www.ctistech.com</a></p>
          </div>

        </div>
      </div>
    `;

    const subject = `Payment Receipt – ${invoiceNumber}`;

    const ok = await sendBrevoEmailWithAttachment({
      toEmail,
      subject,
      html,
      attachmentBase64: pdfBase64,
      attachmentName: `${invoiceNumber}.pdf`,
    });

    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Failed to send receipt email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Receipt email sent with PDF invoice",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error", error: String(err) },
      { status: 500 }
    );
  }
}
