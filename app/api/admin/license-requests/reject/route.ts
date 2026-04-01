import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const supabase = supabaseServer();
    const { request_id, reason } = await req.json();

    if (!request_id) {
      return NextResponse.json(
        { error: "request_id is required" },
        { status: 400 }
      );
    }

    // AUTH CHECK
    const {
      data: { user: admin },
    } = await supabase.auth.getUser();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FETCH REQUEST
    const { data: request } = await supabase
      .from("license_requests")
      .select("id, user_id, request_key, status")
      .eq("id", request_id)
      .single();

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending requests can be rejected" },
        { status: 400 }
      );
    }

    // UPDATE STATUS
    await supabase
      .from("license_requests")
      .update({ status: "rejected", rejection_reason: reason || null })
      .eq("id", request.id);

    // FETCH CLIENT
    const { data: client } = await supabase
      .from("clients")
      .select("email, name")
      .eq("id", request.user_id)
      .single();

    if (client?.email) {
      await sendMail({
        to: client.email,
        subject: "Your License Request Was Rejected",
        html: `
          <h2>Hello ${client.name ?? "Client"},</h2>
          <p>Your license request was rejected.</p>
          <p><strong>Reason:</strong> ${reason || "No reason provided"}</p>
          <p>Request Key:</p>
          <pre>${request.request_key}</pre>
        `,
      });
    }

    // NOTIFICATION
    await supabase.from("notifications").insert({
      user_id: request.user_id,
      title: "License Request Rejected",
      message: reason
        ? `Your request was rejected: ${reason}`
        : "Your request was rejected.",
    });

    return NextResponse.json({
      success: true,
      message: "Request rejected successfully",
    });
  } catch (error: any) {
    console.error("Reject error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
