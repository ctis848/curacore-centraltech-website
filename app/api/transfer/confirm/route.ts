import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

export async function POST(req: Request) {
  const form = await req.formData();

  const proof = form.get("proof") as File | null;
  const plan = form.get("plan") as string | null;
  const amount = form.get("amount") as string | null;
  const licenses = form.get("licenses") as string | null;
  const email = form.get("email") as string | null;
  const company = form.get("company") as string | null;

  if (!proof) {
    return NextResponse.json({ message: "No proof uploaded." }, { status: 400 });
  }

  const supabase = supabaseServer();

  // Upload proof to storage
  const arrayBuffer = await proof.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `proofs/${Date.now()}-${proof.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(filePath, buffer, {
      contentType: proof.type || "application/octet-stream",
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return NextResponse.json(
      { message: "Failed to upload proof." },
      { status: 500 }
    );
  }

  const proofUrl = uploadData?.path || filePath;

  // Save pending transfer record
  const { error: insertError } = await supabase.from("TransferPayments").insert({
    plan,
    amount: Number(amount),
    licenses: Number(licenses),
    email,
    company,
    proof_url: proofUrl,
    status: "PENDING",
  });

  if (insertError) {
    console.error("Insert error:", insertError);
    return NextResponse.json(
      { message: "Failed to save transfer record." },
      { status: 500 }
    );
  }

  // Notify admin
  await sendEmail({
    to: "ctistechnologies@gmail.com",
    subject: "New Transfer Payment Submitted",
    html: `
      <h2>New Transfer Payment Submitted</h2>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Plan:</strong> ${plan}</p>
      <p><strong>Licenses:</strong> ${licenses}</p>
      <p><strong>Amount:</strong> ₦${Number(amount).toLocaleString()}</p>
      <p><strong>Proof Path:</strong> ${proofUrl}</p>
    `,
  });

  return NextResponse.json({
    message:
      "Payment proof received. We will verify and activate your license shortly.",
  });
}
