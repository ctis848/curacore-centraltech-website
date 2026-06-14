import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = supabaseServer();

    // ----------------------------------------------------
    // AUTHENTICATED USER
    // ----------------------------------------------------
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const email = user.email;

    // ----------------------------------------------------
    // FIND CLIENT BY EMAIL
    // ----------------------------------------------------
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!client) {
      return NextResponse.json({ data: [] });
    }

    const clientId = client.id;

    // ----------------------------------------------------
    // FETCH PAYMENTS BY client_id
    // ----------------------------------------------------
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payment history error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // ----------------------------------------------------
    // ENRICH PAYMENTS WITH METADATA
    // ----------------------------------------------------
    const enriched = payments.map((p) => {
      let meta: any = {};

      try {
        if (typeof p.metadata === "string") {
          meta = JSON.parse(p.metadata);
        } else if (typeof p.metadata === "object" && p.metadata !== null) {
          meta = p.metadata;
        }
      } catch {
        meta = {};
      }

      return {
        ...p,
        paymentType: meta.type ?? null,
        plan: meta.plan ?? null,
        quantity: meta.quantity ?? null,
        companyName: meta.companyName ?? null,
      };
    });

    return NextResponse.json({ data: enriched });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
