import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { requestId, amount, notes } = await req.json();

    if (!requestId || !amount) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create invoice
    const { data, error } = await supabase
      .from("invoices")
      .insert({
        request_id: requestId,
        amount,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Update service request status
    const { error: updateError } = await supabase
      .from("service_requests")
      .update({ status: "invoiced" })
      .eq("id", requestId);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
