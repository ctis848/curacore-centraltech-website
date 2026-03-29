import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = supabaseServer();

  const body = await req.json();
  const { license_id, amount } = body;

  if (!license_id || !amount) {
    return NextResponse.json(
      { error: "license_id and amount are required" },
      { status: 400 }
    );
  }

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify license belongs to user
  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("*")
    .eq("id", license_id)
    .eq("user_id", user.id)
    .single();

  if (licenseError || !license) {
    return NextResponse.json(
      { error: "License not found" },
      { status: 404 }
    );
  }

  // Initialize Paystack transaction
  const paystackInit = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // Paystack expects amount in kobo
        metadata: {
          license_id,
          user_id: user.id,
        },
      }),
    }
  );

  const response = await paystackInit.json();

  if (!response.status) {
    return NextResponse.json(
      { error: "Failed to initialize Paystack transaction" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    authorization_url: response.data.authorization_url,
    reference: response.data.reference,
  });
}
