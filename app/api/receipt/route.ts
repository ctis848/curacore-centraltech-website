import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    // Fetch receipt record
    const { data, error } = await supabaseAdmin
      .from("AnnualPaymentHistory")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Safe values
    const amount = Number(data.amount || 0);
    const status = data.status || "unknown";
    const paidAt = data.paidat ? new Date(data.paidat).toLocaleString() : "N/A";
    const licenseCount = data.licensecount || 0;

    const html = `
      <html>
        <body style="font-family: Arial; padding: 20px; max-width: 600px; margin: auto;">
          <h2 style="color: #0d9488;">Annual Renewal Receipt</h2>

          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Paid At:</strong> ${paidAt}</p>
          <p><strong>License Count:</strong> ${licenseCount}</p>

          <hr style="margin: 20px 0;" />

          <p>Thank you for renewing your annual subscription with CentralCore EMR.</p>
          <p>If you have any questions, contact support at <strong>support@ctistech.com</strong>.</p>

          <footer style="margin-top: 40px; font-size: 12px; color: #555;">
            CentralCore EMR • Powered by CTIS Technologies
          </footer>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (err) {
    console.error("RECEIPT ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
