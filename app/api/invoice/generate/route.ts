export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getInvoiceHtml } from "@/lib/pdf/invoiceTemplate";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const html = getInvoiceHtml({
      invoiceNumber: data.invoiceNumber,
      companyName: data.companyName,
      companyEmail: data.companyEmail,
      amount: data.amount,
      dueDate: data.dueDate,
      createdDate: data.createdDate,
      planName: data.planName,
    });

    // ⭐ OPTIMIZED PUPPETEER SETTINGS FOR NETLIFY
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-infobars",
        "--single-process",
      ],
    });

    const page = await browser.newPage();

    // ⭐ Load HTML faster
    await page.setContent(html, { waitUntil: "load" });

    // ⭐ Disable animations for speed
    await page.addStyleTag({
      content: `
        * {
          animation: none !important;
          transition: none !important;
        }
      `,
    });

    // ⭐ Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    const buffer = Buffer.from(pdf);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${data.invoiceNumber}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "PDF generation failed",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
