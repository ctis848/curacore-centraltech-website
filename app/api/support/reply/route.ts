import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { supportTicketTemplate } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const { ticketId, userId, message, fromAdmin } = await req.json();

    if (!ticketId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Find ticket + user
    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // 2. Create reply
    const reply = await db.ticketReply.create({
      data: {
        ticketId,
        userId: userId || null,
        message,
        fromAdmin: !!fromAdmin,
      },
    });

    // 3. Notify user if admin replied
    if (fromAdmin) {
      sendEmail({
        to: ticket.user.email,
        subject: `Update on your support ticket: ${ticket.subject}`,
        html: supportTicketTemplate(ticket.subject, message),
      }).catch((err) =>
        console.error("Support reply email failed:", err)
      );
    }

    return NextResponse.json({ success: true, reply });
  } catch (err) {
    console.error("Reply error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
