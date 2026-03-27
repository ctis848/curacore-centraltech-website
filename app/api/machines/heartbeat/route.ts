import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { licenseKey, machineId, ipAddress, machineName, osVersion } = await req.json();

  const license = await prisma.license.findFirst({
    where: { licenseKey },
  });

  if (!license) {
    return NextResponse.json({ ok: false, error: "Invalid license" }, { status: 400 });
  }

  const activation = await prisma.machineActivation.upsert({
    where: { licenseId_machineId: { licenseId: license.id, machineId } },
    update: { lastSeenAt: new Date(), ipAddress, machineName, osVersion },
    create: {
      licenseId: license.id,
      machineId,
      ipAddress,
      machineName,
      osVersion,
    },
  });

  return NextResponse.json({ ok: true, activationId: activation.id });
}
