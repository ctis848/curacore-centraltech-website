import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const required = [
      "companyName",
      "contactName",
      "email",
      "phone",
      "serviceType",
      "description",
      "location",
    ];

    for (const field of required) {
      if (!body[field] || body[field].trim() === "") {
        return Response.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Insert into the correct table name (case‑sensitive)
    const { data, error } = await supabase
      .from("ServiceRequests")
      .insert({
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        serviceType: body.serviceType,
        description: body.description,
        preferredDate: body.preferredDate || null,
        location: body.location,
      })
      .select()
      .single();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (err: any) {
    console.error("ROUTE ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
