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
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    console.log("🔥 VERIFYING REFERENCE:", reference);

    const verifyRes = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const raw = await verifyRes.text();
    console.log("🔥 RAW PAYSTACK VERIFY RESPONSE:", raw);

    if (raw.startsWith("<")) {
      return NextResponse.json(
        { error: "Paystack returned HTML instead of JSON" },
        { status: 400 }
      );
    }

    const data = JSON.parse(raw);

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const trx = data.data;
    const meta = trx.metadata || {};
    const supabase = supabaseServer();

    console.log("🔥 METADATA RECEIVED:", meta);

    // ============================================================
    // ⭐ 1. HANDLE ANNUAL RENEWAL
    // ============================================================
    if (meta.type === "ANNUAL_RENEWAL") {
      console.log("🔥 PROCESSING ANNUAL RENEWAL");

      // 1️⃣ Load company
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", meta.companyId)
        .single();

      if (!company) {
        return NextResponse.json(
          { error: "Company not found for renewal" },
          { status: 404 }
        );
      }

      // 2️⃣ Load license OR create one if missing
      let { data: license } = await supabase
        .from("License")
        .select("*")
        .eq("companyId", company.id)
        .maybeSingle();

      if (!license) {
        console.log("🔥 NO LICENSE FOUND — creating one automatically");

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

      // 3️⃣ Extend expiration by 1 year
      const now = new Date();
      const newExpiry = new Date(
        now.getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from("License")
        .update({
          expiresAt: newExpiry,
          updatedAt: now.toISOString(),
        })
        .eq("id", license.id);

      // 4️⃣ Update company renewal date
      const nextRenewal = new Date(
        now.getTime() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from("companies")
        .update({ renewal_date: nextRenewal })
        .eq("id", company.id);

      // 5️⃣ Log renewal history
      await supabase.from("AnnualPaymentHistory").insert({
        companyId: company.id,
        amount: trx.amount / 100,
        reference,
        status: "success",
        paidat: trx.paid_at,
        licensecount: company.license_count,
      });

      // 6️⃣ Send renewal email
      sendEmail({
        to: meta.email,
        subject: "Annual Renewal Successful",
        html: `
          <h2>Your Annual Renewal is Complete</h2>
          <p><strong>Company:</strong> ${meta.companyName}</p>
          <p><strong>Amount Paid:</strong> ₦${(trx.amount / 100).toLocaleString()}</p>
          <p><strong>Next Renewal Date:</strong> ${new Date(
            nextRenewal
          ).toLocaleDateString()}</p>
          <p><strong>Reference:</strong> ${reference}</p>
        `,
      }).catch((e) => console.error("🔥 EMAIL ERROR:", e));

      return NextResponse.json({ success: true });
    }

    // ============================================================
    // ⭐ 2. HANDLE NEW LICENSE PURCHASE (unchanged)
    // ============================================================
    const { data: existing } = await supabase
      .from("Clients")
      .select("*")
      .eq("email", meta.email)
      .maybeSingle();

    let clientId;

    if (existing) {
      const newTotal = (existing.totalLicenses || 0) + Number(meta.quantity || 0);

      const { data: updated } = await supabase
        .from("Clients")
        .update({
          totalLicenses: newTotal,
          companyName: meta.companyName,
        })
        .eq("id", existing.id)
        .select()
        .single();

      clientId = updated?.id || existing.id;
    } else {
      const { data: created } = await supabase
        .from("Clients")
        .insert({
          email: meta.email,
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
      amount: trx.amount / 100,
      reference,
    });

    sendEmail({
      to: meta.email,
      subject: "Your CentralCore License Receipt",
      html: `
        <h2>Payment Successful</h2>
        <p><strong>Company:</strong> ${meta.companyName}</p>
        <p><strong>Plan:</strong> ${meta.plan}</p>
        <p><strong>Quantity:</strong> ${meta.quantity}</p>
        <p><strong>Amount Paid:</strong> ₦${(trx.amount / 100).toLocaleString()}</p>
        <p><strong>Reference:</strong> ${reference}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 VERIFY ROUTE CRASH:", err);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
