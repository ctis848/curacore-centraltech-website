import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing company ID" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // Load session user (for email)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Load company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // Annual fee
    const annualFee = Number(company.annual_price || 0);

    if (!annualFee || annualFee <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid annual fee" },
        { status: 400 }
      );
    }

    // Metadata
    const metadata = {
      type: "ANNUAL_RENEWAL",
      companyId: company.id,
      companyName: company.name,
      email: user.email, // ⭐ FIXED
      annualFee,
      description: "Annual Subscription Renewal",
    };

    // Reference
    const reference = `RN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Initialize Paystack
    const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email, // ⭐ FIXED
        amount: annualFee * 100,
        currency: "NGN",
        reference,
        metadata,
        callback_url: `${APP_URL}/payment/callback?reference=${reference}`,
      }),
    });

    const raw = await response.text();

    if (raw.startsWith("<")) {
      return NextResponse.json(
        { success: false, error: "Paystack returned HTML. Invalid payload." },
        { status: 400 }
      );
    }

    const data = JSON.parse(raw);

    if (!data.status) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
    });

  } catch (err: any) {
    console.error("RENEW ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
