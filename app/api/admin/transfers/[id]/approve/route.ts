import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { generateInvoicePdfBuffer } from "@/lib/invoice/pdf";
import { sendEmail } from "@/lib/email/send";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseServer();
  const id = Number(params.id);

  const { data: transfer, error } = await supabase
    .from("TransferPayments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !transfer) {
    return NextResponse.json(
      { success: false, error: "Transfer not found" },
      { status: 404 }
    );
  }

  // Mark as approved
  await supabase
    .from("TransferPayments")
    .update({ status: "APPROVED" })
    .eq("id", id);

  // Upsert client
  const { data: existingClient } = await supabase
    .from("Clients")
    .select("*")
    .eq("email", transfer.email)
    .maybeSingle();

  const quantity = Number(transfer.licenses || 1);
  let clientId;

  if (existingClient) {
    const newTotal =
      (existingClient.totalLicenses || 0) + quantity;

    const { data: updated } = await supabase
      .from("Clients")
      .update({
        totalLicenses: newTotal,
        companyName: transfer.company,
      })
      .eq("id", existingClient.id)
      .select()
      .single();

    clientId = updated?.id || existingClient.id;
  } else {
    const { data: created } = await supabase
      .from("Clients")
      .insert({
        email: transfer.email,
        companyName: transfer.company,
        totalLicenses: quantity,
      })
      .select()
      .single();

    clientId = created?.id;
  }

  // Create LicensePurchases record
  const reference = `TRANSFER-${transfer.id}`;
  await supabase.from("LicensePurchases").insert({
    clientId,
    plan: transfer.plan,
    quantity,
    amount: transfer.amount,
    reference,
    channel: "bank_transfer_manual",
  });

  // Generate invoice PDF
  const pdfBuffer = await generateInvoicePdfBuffer({
    company: transfer.company || "",
    email: transfer.email || "",
    plan: transfer.plan || "",
    quantity,
    amount: transfer.amount || 0,
    reference,
  });

  const { data: pdfUpload, error: pdfError } = await supabase.storage
    .from("invoices")
    .upload(`invoices/${reference}.pdf`, pdfBuffer, {
      contentType: "application/pdf",
    });

  if (pdfError) {
    console.error("Invoice upload error:", pdfError);
  }

  // Email customer
  if (transfer.email) {
    await sendEmail({
      to: transfer.email,
      subject: "Your CentralCore License (Bank Transfer Approved)",
      html: `
        <h2>Payment Approved</h2>
        <p><strong>Company:</strong> ${transfer.company}</p>
        <p><strong>Plan:</strong> ${transfer.plan}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Amount Paid:</strong> ₦${Number(
          transfer.amount || 0
        ).toLocaleString()}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p>Your license count has been updated in your client portal.</p>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
