import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { supportReplyTemplate } from "@/lib/email/templates/supportReply";

interface Params {
  params: { id: string };
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { reply, adminId } = await req.json();
    const ticketId = params.id;

    // 1. Fetch ticket (service role bypasses RLS)
    const { data: ticket, error: ticketError } = await admin
      .from("SupportTicket")
      .select("*, User(email)")
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    // 2. Insert admin reply
    const replyId = crypto.randomUUID();

    const { error: replyError } = await admin
      .from("TicketReply")
      .insert({
        id: replyId,
        ticketId,
        userId: adminId,
        isFromAdmin: true,
        message: reply,
      });

    if (replyError) {
      return NextResponse.json(
        { success: false, message: replyError.message },
        { status: 500 }
      );
    }

    // 3. Send email notification using Brevo + HTML template
    const userEmail = ticket.User?.email;

    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: `Reply to your support ticket: ${ticket.subject}`,
        html: supportReplyTemplate(reply, ticket.subject),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully.",
    });

  } catch (err: any) {
    console.error("Admin Reply Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
