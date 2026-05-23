import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
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

  await supabase
    .from("TransferPayments")
    .update({ status: "REJECTED" })
    .eq("id", id);

  if (transfer.email) {
    await sendEmail({
      to: transfer.email,
      subject: "Transfer Payment Rejected",
      html: `
        <h2>Payment Could Not Be Verified</h2>
        <p><strong>Company:</strong> ${transfer.company}</p>
        <p><strong>Plan:</strong> ${transfer.plan}</p>
        <p><strong>Amount:</strong> ₦${Number(
          transfer.amount || 0
        ).toLocaleString()}</p>
        <p>Please contact support at info@ctistech.com for assistance.</p>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
