export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const licenses = await prisma.license.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gte: now, lte: in7Days },
      },
      include: { user: true },
    });

    let createdInvoices = 0;

    for (const l of licenses) {
      if (!l.user?.email) continue;

      const invoice = await prisma.invoice.create({
        data: {
          userId: l.userId,
          licenseId: l.id,
          amount: l.annualFeePercent ?? 0,
          currency: "NGN",
          status: "PENDING",
          description: `Renewal for license ${l.licenseKey}`,
        },
      });

      createdInvoices++;

      // Send Brevo email via your notification API
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: l.user.name ?? "Customer",
          companyEmail: l.user.email,
          amount: invoice.amount,
          paymentDate: new Date().toISOString(),
          paymentRef: invoice.id,
          paymentLink: `${process.env.NEXT_PUBLIC_SITE_URL}/pay/${invoice.id}`,
        }),
      });

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
