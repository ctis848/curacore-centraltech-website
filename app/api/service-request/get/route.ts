import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("ServiceRequests")   // correct table name
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    return Response.json({ data });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
