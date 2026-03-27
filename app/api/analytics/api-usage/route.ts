import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

  const totalCalls = await prisma.apiLog.count();

  const errors = await prisma.apiLog.count({
    where: { statusCode: { gte: 400 } },
  });

  const topEndpoints = await prisma.$queryRawUnsafe(`
    SELECT "endpoint", COUNT(*) AS calls
    FROM "ApiLog"
    GROUP BY "endpoint"
    ORDER BY calls DESC
    LIMIT 10;
  `);

  const recent = await prisma.apiLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    totalCalls,
    errors,
    topEndpoints,
    recent,
  });
}
