import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenant = searchParams.get("tenant");

  // You currently have no tenantId on User or License,
  // so we can't filter by tenant. We ignore it for now.
  const whereUser = undefined;
  const whereLicense = undefined;

  const totalUsers = await db.user.count({ where: whereUser });
  const totalLicenses = await db.license.count({ where: whereLicense });
  const activeLicenses = await db.license.count({
    where: { status: "ACTIVE" },
  });

  const pendingRequests = await db.licenseRequest.count({
    where: { status: "PENDING" },
  });

  const supportTickets = await db.supportTicket.count({
    where: { status: "OPEN" },
  });

  const monthlyRevenue = await db.invoice.aggregate({
    _sum: { amount: true },
    where: {
      status: "PAID",
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  return NextResponse.json({
    totalUsers,
    totalLicenses,
    activeLicenses,
    pendingRequests,
    supportTickets,
    monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
  });
}
