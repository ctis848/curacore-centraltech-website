import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// simple email stub
async function sendEmail(to: string, subject: string, body: string) {
  console.log("EMAIL:", to, subject);
}

export async function GET() {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find licenses expiring within 7 days
    const licenses = await prisma.license.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gte: now, lte: in7Days },
      },
      include: { user: true }, // FIXED: lowercase relation
    });

    let createdInvoices = 0;

    for (const l of licenses) {
      if (!l.user?.email) continue;

      // Create renewal invoice
      const invoice = await prisma.invoice.create({
        data: {
          userId: l.userId,
          licenseId: l.id,
          amount: l.annualFeePercent ?? 0, // adjust to real pricing
          currency: "NGN",
          status: "PENDING",
          description: `Renewal for license ${l.licenseKey}`,
        },
      });

      createdInvoices++;

      // Send email
      await sendEmail(
        l.user.email,
        "Your CentralCore EMR license renewal",
        `Your license ${l.licenseKey} will expire on ${l.expiresAt?.toDateString()}.\n\nA renewal invoice (${invoice.id}) has been created.`
      );

      // Optional: create notification
      await prisma.notification.create({
        data: {
          userId: l.userId,
          type: "RENEWAL",
          message: `Renewal invoice created for license ${l.licenseKey}`,
        },
      });
    }

    return NextResponse.json({
      processed: licenses.length,
      invoices: createdInvoices,
    });
  } catch (error: any) {
    console.error("Renewal cron error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
