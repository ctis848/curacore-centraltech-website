import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  const { data, error } = await supabaseAdmin
    .from("AnnualPaymentHistory")
    .select("*")
    .eq("reference", reference)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  const html = `
    <html>
      <body style="font-family: Arial; padding: 20px;">
        <h2>Renewal Receipt</h2>
        <p><strong>Reference:</strong> ${data.reference}</p>
        <p><strong>Amount:</strong> ₦${Number(data.amount).toLocaleString()}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Paid At:</strong> ${new Date(data.paidat).toLocaleString()}</p>
        <p><strong>Licenses:</strong> ${data.licensecount}</p>
        <hr />
        <p>Thank you for renewing your annual subscription.</p>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
