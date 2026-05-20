export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    console.log("🔥 VERIFYING PAYMENT:", reference);

    // ============================================================
    // 1️⃣ VERIFY WITH PAYSTACK
    // ============================================================
    const verifyRes = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
    });

    const raw = await verifyRes.text();
    console.log("🔥 RAW PAYSTACK RESPONSE:", raw);

    if (raw.startsWith("<")) {
      return NextResponse.json(
        { success: false, error: "Paystack returned HTML instead of JSON" },
        { status: 400 }
      );
    }

    const data = JSON.parse(raw);

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const trx = data.data;
    const meta = trx.metadata || {};
    const supabase = supabaseServer();

    console.log("🔥 METADATA:", meta);

    const customerEmail = meta.email;
    const amountPaid = trx.amount / 100;

    // ============================================================
    // 2️⃣ CHECK IF USER EXISTS (for callback redirect)
    // ============================================================
    const { data: existingUser } = await supabase
      .from("auth.users")
      .select("id, email")
      .eq("email", customerEmail)
      .maybeSingle();

    // ============================================================
    // 3️⃣ HANDLE ANNUAL RENEWAL
    // ============================================================
    if (meta.type === "ANNUAL_RENEWAL") {
      console.log("🔥 PROCESSING ANNUAL RENEWAL");

      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", meta.companyId)
        .single();

      if (!company) {
        return NextResponse.json(
          { success: false, error: "Company not found for renewal" },
          { status: 404 }
        );
      }

      // Load or create license
      let { data: license } = await supabase
        .from("License")
        .select("*")
        .eq("companyId", company.id)
        .maybeSingle();

      if (!license) {
        console.log("🔥 NO LICENSE FOUND — creating new license");

        const { data: newLicense } = await supabase
          .from("License")
          .insert({
            companyId: company.id,
            expiresAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .select()
          .single();

        license = newLicense;
      }

      // Extend expiration
      const now = new Date();
      const newExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

      await supabase
        .from("License")
        .update({
          expiresAt: newExpiry,
          updatedAt: now.toISOString(),
        })
        .eq("id", license.id);

      // Update company renewal date
      const nextRenewal = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

      await supabase
        .from("companies")
        .update({ renewal_date: nextRenewal })
        .eq("id", company.id);

      // Log renewal
      await supabase.from("AnnualPaymentHistory").insert({
        companyId: company.id,
        amount: amountPaid,
        reference,
        status: "success",
        paidat: trx.paid_at,
        licensecount: company.license_count,
      });

      // Send email
      sendEmail({
        to: customerEmail,
        subject: "Annual Renewal Successful",
        html: `
          <h2>Your Annual Renewal is Complete</h2>
          <p><strong>Company:</strong> ${meta.companyName}</p>
          <p><strong>Amount Paid:</strong> ₦${amountPaid.toLocaleString()}</p>
          <p><strong>Next Renewal Date:</strong> ${new Date(nextRenewal).toLocaleDateString()}</p>
          <p><strong>Reference:</strong> ${reference}</p>
        `,
      }).catch((e) => console.error("🔥 EMAIL ERROR:", e));

      return NextResponse.json({
        success: true,
        existingUser: !!existingUser,
        email: customerEmail,
      });
    }

    // ============================================================
    // 4️⃣ HANDLE NEW LICENSE PURCHASE
    // ============================================================
    const { data: existingClient } = await supabase
      .from("Clients")
      .select("*")
      .eq("email", customerEmail)
      .maybeSingle();

    let clientId;

    if (existingClient) {
      const newTotal = (existingClient.totalLicenses || 0) + Number(meta.quantity || 0);

      const { data: updated } = await supabase
        .from("Clients")
        .update({
          totalLicenses: newTotal,
          companyName: meta.companyName,
        })
        .eq("id", existingClient.id)
        .select()
        .single();

      clientId = updated?.id || existingClient.id;
    } else {
      const { data: created } = await supabase
        .from("Clients")
        .insert({
          email: customerEmail,
          companyName: meta.companyName,
          totalLicenses: meta.quantity,
        })
        .select()
        .single();

      clientId = created?.id;
    }

    await supabase.from("LicensePurchases").insert({
      clientId,
      plan: meta.plan,
      quantity: meta.quantity,
      amount: amountPaid,
      reference,
    });

    sendEmail({
      to: customerEmail,
      subject: "Your CentralCore License Receipt",
      html: `
        <h2>Payment Successful</h2>
        <p><strong>Company:</strong> ${meta.companyName}</p>
        <p><strong>Plan:</strong> ${meta.plan}</p>
        <p><strong>Quantity:</strong> ${meta.quantity}</p>
        <p><strong>Amount Paid:</strong> ₦${amountPaid.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${reference}</p>
      `,
    });

    return NextResponse.json({
      success: true,
      existingUser: !!existingUser,
      email: customerEmail,
    });
  } catch (err) {
    console.error("🔥 VERIFY ROUTE CRASH:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
