import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseAdmin;

  const { data: license } = await supabase
    .from("License")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!license) {
    return new Response("License not found", { status: 404 });
  }

  const content = `
Product: ${license.productName}
License Key: ${license.licenseKey}
Status: ${license.status}
Issued: ${license.createdAt}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="license-${license.id}.txt"`,
    },
  });
}
