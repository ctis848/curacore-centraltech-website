import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getInvoiceHtml } from "@/lib/pdf/invoiceTemplate";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const invoiceNumber = searchParams.get("invoiceNumber");

  if (!invoiceNumber) {
    return NextResponse.json({ error: "Missing invoice number" }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("invoice_number", invoiceNumber)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const html = getInvoiceHtml({
    invoiceNumber: invoice.invoice_number,
    companyName: invoice.company_name,
    companyEmail: invoice.company_email,
    amount: invoice.amount,
    planName: invoice.plan_name,
    createdDate: invoice.created_at,
    dueDate: invoice.due_date,
  });

  return NextResponse.json({
    invoice: {
      ...invoice,
      html,
    },
  });
}
