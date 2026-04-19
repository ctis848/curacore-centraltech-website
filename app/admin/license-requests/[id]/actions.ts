"use server";

import { supabaseServer } from "@/lib/supabase/server";

export async function sendLicenseKey(licenseRequestId: string, generatedKey: string) {
  const supabase = supabaseServer();

  // 1. Get the LicenseRequest
  const { data: req, error: reqError } = await supabase
    .from("LicenseRequest")
    .select("id, userId, productName")
    .eq("id", licenseRequestId)
    .single();

  if (reqError || !req) throw new Error("LicenseRequest not found");

  // 2. Get the user email
  const { data: user, error: userError } = await supabase
    .from("User")
    .select("email")
    .eq("id", req.userId)
    .single();

  if (userError || !user) throw new Error("User not found");

  // 3. Upsert License for this request
  const { error: licenseError } = await supabase
    .from("License")
    .upsert(
      {
        licenseRequestId: req.id,
        userId: req.userId,
        productName: req.productName ?? "Unknown Product",
        licenseKey: generatedKey,
        userEmail: user.email,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      { onConflict: "licenseRequestId" }
    );

  if (licenseError) throw licenseError;

  // 4. Mark LicenseRequest as APPROVED
  await supabase
    .from("LicenseRequest")
    .update({
      status: "APPROVED",
      license_key: generatedKey,
      processedAt: new Date(),
    })
    .eq("id", req.id);

  return true;
}
