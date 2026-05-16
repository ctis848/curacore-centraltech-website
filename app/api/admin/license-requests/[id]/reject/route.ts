import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";

type Params = {
  params: { id: string };
};

export async function POST(_req: Request, { params }: Params) {
  const { id } = params;

  // Load request to get email + product
  const { data: reqRow, error: loadError } = await supabaseAdmin
    .from("LicenseRequest")
    .select("userEmail, productName")
    .eq("id", id)
    .single();

  if (loadError || !reqRow) {
    console.error("Load request error:", loadError);
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  const { error: updateError } = await supabaseAdmin
    .from("LicenseRequest")
    .update({ status: "REJECTED" })
    .eq("id", id);

  if (updateError) {
    console.error("Reject update error:", updateError);
    return NextResponse.json(
      { error: "Failed to reject request" },
      { status: 500 }
    );
  }

  // Email notification to client: request rejected
  if (reqRow.userEmail) {
    await sendEmail({
      to: reqRow.userEmail,
      subject: "License Request Rejected",
      html: `
        <p>Hello,</p>
        <p>Your license request for <strong>${reqRow.productName}</strong> has been rejected.</p>
        <p>If you believe this is an error, please contact support.</p>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
