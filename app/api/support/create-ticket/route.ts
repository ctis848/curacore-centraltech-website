import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/brevo";
import { supportTicketTemplate } from "@/lib/email/templates";

export async function POST(req: Request) {
  try {
    const { userId, subject, message } = await req.json();

    if (!userId || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Find user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2. Create support ticket
    const ticket = await db.supportTicket.create({
      data: {
        userId,
        subject,
        message,
        status: "OPEN",
      },
    });

    // 3. Send confirmation email to user
    sendEmail({
      to: user.email,
      subject: "Support Ticket Received",
      html: supportTicketTemplate(subject, message),
    }).catch((err) => console.error("Support ticket email failed:", err));

    // 4. Notify admin
    sendEmail({
      to: "support@centraltech.com",
      subject: "New Support Ticket",
      html: `
        <h2>New Support Ticket</h2>
        <p><strong>User:</strong> ${user.email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: "Support ticket created successfully.",
    });
  } catch (err) {
    console.error("Support Ticket Error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
