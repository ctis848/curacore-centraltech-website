import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { requestId, items, total } = await req.json();

    if (!requestId || !items || !total) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("proforma_invoices")
      .insert([
        {
          request_id: requestId,
          items,
          total,
        },
      ])
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await supabase
      .from("service_requests")
      .update({ status: "proforma_generated" })
      .eq("id", requestId);

    return Response.json({ success: true, data });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
