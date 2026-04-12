import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function GET() {
  try {
    // 1. Fetch license requests
    const { data: requests, error: reqErr } = await supabaseAdmin
      .from("license_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (reqErr) {
      console.error("LICENSE REQUESTS ERROR:", reqErr);
      return NextResponse.json(
        { error: "Failed to load license requests", details: reqErr.message },
        { status: 500 }
      );
    }

    // 2. Fetch all auth users
    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers();

    if (usersErr) {
      console.error("AUTH USERS ERROR:", usersErr);
      return NextResponse.json(
        { error: "Failed to load users", details: usersErr.message },
        { status: 500 }
      );
    }

    const users = usersData?.users || [];

    // 3. Build a map for fast lookup
    const userMap = new Map();
    users.forEach((u: any) => {
      userMap.set(u.id, u.email);
    });

    // 4. Merge requests with user emails
    const final = requests.map((r: any) => ({
      id: r.id,
      user_email: userMap.get(r.user_id) || "Unknown",
      product_name: r.product_name,
      machine_id: r.machine_id,
      request_key: r.request_key,
      status: r.status,
      created_at: r.created_at,
      notes: r.notes,
    }));

    return NextResponse.json({ requests: final });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
