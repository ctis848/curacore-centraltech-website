import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import os from "os";

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

  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbLatency = Date.now() - start;

  const throughput = await prisma.apiLog.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 60 * 1000),
      },
    },
  });

  return NextResponse.json({
    dbLatency,
    cpuLoad: os.loadavg(),
    memory: process.memoryUsage(),
    throughputPerMinute: throughput,
  });
}
