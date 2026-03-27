import { NextResponse } from "next/server";
import { PrismaClient, LicenseStatus } from "@prisma/client";

const prisma = new PrismaClient();
export const runtime = "nodejs";

async function requireAdmin(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("session="));

  const token = sessionCookie?.split("=")[1];
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.user.role !== "ADMIN") return null;
  return session.user;
}

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Licenses with more than 1 machine
  const multiMachine = await prisma.$queryRawUnsafe(`
    SELECT "licenseId", COUNT(*) AS machines
    FROM "MachineActivation"
    GROUP BY "licenseId"
    HAVING COUNT(*) > 1;
  `);

  // 2. Suspicious IP changes
  const suspiciousIPs = await prisma.$queryRawUnsafe(`
    SELECT "licenseId", COUNT(DISTINCT "ipAddress") AS ips
    FROM "MachineActivation"
    GROUP BY "licenseId"
    HAVING COUNT(DISTINCT "ipAddress") > 3;
  `);

  // 3. Expired licenses still active
  const expiredActive = await prisma.license.findMany({
    where: {
      status: LicenseStatus.EXPIRED,
      machineActivations: { some: {} },    },
  });

  return NextResponse.json({
    multiMachine,
    suspiciousIPs,
    expiredActive,
  });
}
