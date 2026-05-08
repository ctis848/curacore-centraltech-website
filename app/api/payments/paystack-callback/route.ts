import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "charge.success") {
    return NextResponse.json({ status: "ignored" });
  }

  const data = event.data;
  const email = data.customer.email;
  const amountPaid = data.amount / 100;
  const reference = data.reference;

  // Get user by email
  const { data: user } = await supabaseAdmin
    .from("UserProfile")
    .select("id")
    .eq("email", email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userId = user.id;

  // Count active licenses
  const { data: activeLicenses } = await supabaseAdmin
    .from("License")
    .select("id")
    .eq("userId", userId)
    .eq("status", "ACTIVE");

  const licenseCount = activeLicenses?.length || 0;

  // Calculate next renewal date (+1 year)
  const nextRenewal = new Date();
  nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);

  // Update all active licenses
  await supabaseAdmin
    .from("License")
    .update({
      annualFeePaidUntil: nextRenewal.toISOString(),
      renewalstatus: "NOT_DUE",
      updatedAt: new Date().toISOString(),
    })
    .eq("userId", userId)
    .eq("status", "ACTIVE");

  // Insert into AnnualPaymentHistory
  await supabaseAdmin.from("AnnualPaymentHistory").insert({
    userid: userId,
    amount: amountPaid,
    reference,
    status: "SUCCESS",
    paidat: new Date().toISOString(),
    licensecount: licenseCount,
  });

  return NextResponse.json({ status: "success" });
}
