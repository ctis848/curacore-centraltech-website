import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    return Response.json(
      { error: "Technician assignment is no longer supported." },
      { status: 400 }
    );
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
